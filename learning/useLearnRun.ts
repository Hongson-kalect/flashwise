import { getMyCollection } from "@/database/queries/collections";
import { autoKnownBands } from "@/database/queries/knownStats";
import { getMedianStepMs, loadLearnSettings, pickNewCards, saveLearnResult, SaveSummary, LearnSettings } from "@/database/queries/learning";
import { useAppStore } from "@/stores/appStore";
import { rescheduleReminders } from "@/services/reminder";
import { requestSync } from "@/services/sync/bus";
import { prefetchTranslation } from "@/services/api/senses";
import { downloadBundle } from "@/services/collections";
import { readyWriteLangs } from "./inkAvailability";
import { voiceCapabilities } from "./speechRecognizer";
import { uuidv7 } from "@/utils/uuidv7";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import { Action, currentQuestion, reduce, resultsOf, RunState, startRun } from "./engine";
import { clearSnapshot, loadSnapshot, saveSnapshot, Snapshot } from "./snapshot";
import { bandOf } from "./knownStats";
import { Grade } from "./types";

export type RunStatus = "loading" | "resume" | "empty" | "error" | "running" | "saving" | "done";

/** Phần lưu để học tiếp: trạng thái máy học + thông tin phiên. */
interface SavedRun {
  state: RunState;
  session: { id: string; collectionId: string | null; startedAt: number; settings: LearnSettings };
}

export interface RunMeta {
  collectionName: string;
  /** Nghĩa mới còn lại trong bộ sau cụm này (và bao nhiêu chưa có bản dịch). */
  remaining: number;
  waitingTranslation: number;
  /** Số nghĩa trong bộ (bộ rỗng khác bộ đã học hết). */
  total: number;
}

/**
 * Nối máy trạng thái phiên học (learning/engine) với SQLite và React: nạp cụm nghĩa mới của 1 bộ, giữ trạng thái,
 * ghi kết quả khi xong. UI chỉ đọc `state` / `question` và gọi các hàm bên dưới.
 */
export const useLearnRun = (userCollectionId: string) => {
  const db = useSQLiteContext();
  const userLang = useAppStore((s) => s.settings?.translate_language) ?? "vi";
  const [status, setStatus] = useState<RunStatus>("loading");
  const [state, setState] = useState<RunState | null>(null);
  const [meta, setMeta] = useState<RunMeta | null>(null);
  const [summary, setSummary] = useState<SaveSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const session = useRef<{ id: string; collectionId: string | null; startedAt: number; settings: LearnSettings } | null>(null);

  const scope = `learn:${userCollectionId}`;
  const resumable = useRef<Snapshot<SavedRun> | null>(null);
  /** Nghĩa mới kế tiếp còn thiếu bản dịch (gửi dịch trước). */
  const missing = useRef<string[]>([]);

  /** `fresh` = bỏ phiên dở, bắt đầu cụm mới; không thì có phiên dở còn hạn sẽ hỏi học tiếp. */
  const load = useCallback(async (fresh: boolean | unknown = false) => {
    setStatus("loading");
    setSummary(null);
    setError(null);
    resumable.current = null;
    try {
      const [settings, info, median] = await Promise.all([loadLearnSettings(db), getMyCollection(db, userCollectionId), getMedianStepMs(db)]);
      if (!info) throw new Error("Không tìm thấy bộ từ");
      const picked = await pickNewCards(db, userCollectionId, userLang, settings.clusterSize);
      missing.current = picked.missingSenseIds;
      setMeta({ collectionName: info.name, remaining: Math.max(0, picked.available - picked.cards.length), waitingTranslation: picked.waitingTranslation, total: info.total });
      if (fresh === true) await clearSnapshot(db, scope);
      else {
        const snap = await loadSnapshot<SavedRun>(db, scope);
        if (snap) {
          resumable.current = snap;
          setStatus("resume");
          return;
        }
      }
      if (!picked.cards.length) {
        setState(null);
        setStatus("empty");
        return;
      }
      const now = Date.now();
      session.current = { id: uuidv7(), collectionId: info.collectionId, startedAt: now, settings };
      const autoBands = settings.autoKnown ? await autoKnownBands(db) : new Set<string>();
      const preKnown = picked.cards.filter((c) => autoBands.has(bandOf(c.level))).map((c) => c.key);
      setState(startRun({ cards: picked.cards, extraPool: picked.pool, preKnown, clusterSteps: settings.clusterSteps, now, medianMs: median, caps: { ...voiceCapabilities(settings), write: settings.writable ? await readyWriteLangs(picked.cards.map((c) => c.lang)) : [] } }));
      setStatus("running");
    } catch (e: any) {
      setError(e?.message ?? "Có lỗi xảy ra");
      setStatus("error");
    }
  }, [db, userCollectionId, userLang, scope]);

  useEffect(() => {
    load();
  }, [load]);

  /** Nghĩa mới kế tiếp thiếu bản dịch: nhờ server dịch trước; có nghĩa đã đủ thì tải lại bộ để máy thấy. Trả có nghĩa mới đủ không. */
  const prefetch = useCallback(async (ids: string[]) => {
    try {
      const { ready } = await prefetchTranslation(ids, userLang);
      if (!ready.length) return false;
      await downloadBundle(db, userCollectionId, userLang, { force: true, retries: 0 });
      return true;
    } catch {
      return false; // offline / chưa đăng nhập: bỏ qua, lần mở sau thử lại
    }
  }, [db, userCollectionId, userLang]);

  // Cụm kế tiếp thiếu bản dịch: dịch nền khi đang học (không chặn)
  useEffect(() => {
    if (status === "running" && missing.current.length) prefetch(missing.current);
  }, [status, prefetch]);

  // Hết nghĩa sẵn sàng mà còn nghĩa chờ dịch: hỏi lại mỗi 5 giây (tối đa 6 lần), có bản dịch thì nạp cụm ngay
  useEffect(() => {
    if (status !== "empty" || !missing.current.length) return;
    let cancelled = false;
    let tries = 0;
    const timer = setInterval(async () => {
      if (++tries > 6) return clearInterval(timer);
      if (await prefetch(missing.current)) {
        clearInterval(timer);
        if (!cancelled) load();
      }
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [status, prefetch, load]);

  /** Học tiếp phiên dở: dựng lại trạng thái từ snapshot (bước đang dở tính giờ lại từ bây giờ). */
  const resume = useCallback(() => {
    const snap = resumable.current;
    if (!snap) return;
    const now = Date.now();
    session.current = snap.data.session;
    setState({ ...snap.data.state, attempt: { ...snap.data.state.attempt, startedAt: now } });
    setStatus("running");
  }, []);

  /** Bỏ phiên dở, bắt đầu cụm mới. */
  const discard = useCallback(() => load(true), [load]);

  // Lưu phiên đang chạy sau mỗi bước để thoát giữa chừng / app bị tắt vẫn học tiếp được
  const doneSteps = state?.doneSteps;
  const phase = state?.phase;
  useEffect(() => {
    if (status !== "running" || !state || !session.current) return;
    saveSnapshot(db, scope, { state, session: session.current } satisfies SavedRun).catch(() => {});
  }, [status, doneSteps, phase]);

  const dispatch = useCallback((action: Action) => setState((prev) => (prev ? reduce(prev, action) : prev)), []);

  const answer = useCallback((value: string) => dispatch({ type: "answer", value, at: Date.now() }), [dispatch]);
  const hint = useCallback(() => dispatch({ type: "hint", at: Date.now() }), [dispatch]);
  const speech = useCallback((transcripts: string[]) => dispatch({ type: "speech", transcripts, at: Date.now() }), [dispatch]);
  const skipSpeak = useCallback(() => dispatch({ type: "fallbackKind", kinds: ["speak"], at: Date.now() }), [dispatch]);
  const skipListen = useCallback(() => dispatch({ type: "fallbackKind", kinds: ["listenChoose", "dictation"], at: Date.now() }), [dispatch]);
  const written = useCallback((cells: string[][]) => dispatch({ type: "written", cells, at: Date.now() }), [dispatch]);
  const skipWrite = useCallback(() => dispatch({ type: "skipKind", kind: "handwrite", at: Date.now() }), [dispatch]);
  const known = useCallback(() => dispatch({ type: "known", at: Date.now() }), [dispatch]);
  const next = useCallback(() => dispatch({ type: "next", at: Date.now() }), [dispatch]);
  const setGrade = useCallback((key: string, grade: Grade) => dispatch({ type: "setGrade", key, grade }), [dispatch]);

  /** Ở tổng kết: ghi tiến độ + log của cụm vào SQLite. */
  const finish = useCallback(async () => {
    if (!state || state.phase !== "summary" || !session.current || status === "saving") return;
    setStatus("saving");
    try {
      const s = session.current;
      const result = await saveLearnResult(db, { sessionId: s.id, collectionId: s.collectionId, startedAt: s.startedAt, endedAt: Date.now(), results: resultsOf(state) }, s.settings);
      await clearSnapshot(db, scope);
      setSummary(result);
      setStatus("done");
      requestSync();
      rescheduleReminders(db).catch(() => {}); // đã học hôm nay thì bỏ nhắc hôm nay
    } catch (e: any) {
      setError(e?.message ?? "Không lưu được phiên học");
      setStatus("error");
    }
  }, [db, state, status, scope]);

  return {
    status, state, meta, summary, error, question: state ? currentQuestion(state) : undefined, userLang,
    resumeInfo: resumable.current ? { savedAt: resumable.current.savedAt, doneSteps: resumable.current.data.state.doneSteps, totalSteps: resumable.current.data.state.totalSteps } : null,
    answer, hint, speech, skipSpeak, skipListen, written, skipWrite, known, next, setGrade, finish, resume, discard, reload: () => load(true),
  };
};
