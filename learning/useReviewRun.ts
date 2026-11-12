import { getMedianStepMs, loadLearnSettings, LearnSettings } from "@/database/queries/learning";
import { pickReviewBatch, ReviewBatch, reviewResultsFromCluster, ReviewSummary, saveReviewResult } from "@/database/queries/review";
import { useAppStore } from "@/stores/appStore";
import { rescheduleReminders } from "@/services/reminder";
import { requestSync } from "@/services/sync/bus";
import { readyWriteLangs } from "./inkAvailability";
import { voiceCapabilities } from "./speechRecognizer";
import { uuidv7 } from "@/utils/uuidv7";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import { Action, currentQuestion, reduce, resultsOf, RunState, startRun } from "./engine";
import { clearSnapshot, loadSnapshot, saveSnapshot, Snapshot } from "./snapshot";
import { reduceSwipe, startSwipe, SwipeAction, SwipeState, swipeResults } from "./swipe";
import { Grade } from "./types";

const SCOPE = "review";

/** Phần lưu để ôn tiếp: chồng vuốt hoặc cụm đang dở, kèm thông tin phiên. */
interface SavedReview {
  kind: "swipe" | "cluster";
  swipe?: SwipeState;
  run?: RunState;
  session: { id: string; startedAt: number };
  remaining: number;
}

export type ReviewStatus = "loading" | "resume" | "choose" | "empty" | "swiping" | "cluster" | "saving" | "saved" | "error";

/**
 * Nối phiên ôn tập với SQLite: lấy lượt thẻ đến hạn, thẻ cấp cao ôn bằng vuốt trước (nhanh), rồi thẻ cấp thấp theo cụm.
 * Cài đặt `ask_review_mode` bật và có thẻ cấp cao đến hạn thì hỏi trước (status `choose`): vuốt nhanh như trên, hoặc kiểu truyền thống
 * (gộp thẻ cấp cao với thẻ thấp, tất cả ôn theo cụm). Lựa chọn nhớ trong lần mở màn này, "Ôn tiếp" không hỏi lại.
 * Mỗi lượt xong thì ghi kết quả; còn thẻ đến hạn thì "Ôn tiếp" nạp lượt kế.
 */
export const useReviewRun = () => {
  const db = useSQLiteContext();
  const userLang = useAppStore((s) => s.settings?.translate_language) ?? "vi";
  const [status, setStatus] = useState<ReviewStatus>("loading");
  const [swipe, setSwipe] = useState<SwipeState | null>(null);
  const [run, setRun] = useState<RunState | null>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<LearnSettings | null>(null);
  const session = useRef<{ id: string; startedAt: number } | null>(null);
  const saving = useRef(false);
  /** Thẻ đã ôn trong lần mở màn này: thẻ vừa ôn thường hẹn lại sau vài giờ (vẫn trước cuối ngày học) nên không đưa lại ngay. */
  const reviewed = useRef(new Set<string>());

  const resumable = useRef<Snapshot<SavedReview> | null>(null);
  const modeChoice = useRef<"swipe" | "traditional" | null>(null);
  const pending = useRef<{ batch: ReviewBatch; s: LearnSettings } | null>(null);
  const [choice, setChoice] = useState<{ quick: number; normal: number } | null>(null);

  /** Bắt đầu lượt ôn từ lượt thẻ đã chọn: chồng vuốt nếu có thẻ vuốt, không thì cụm. */
  const begin = useCallback(
    async (batch: ReviewBatch, s: LearnSettings) => {
      setRemaining(batch.quickTotal + batch.normalTotal);
      const now = Date.now();
      session.current = { id: uuidv7(), startedAt: now };
      const levels = (list: { card: { key: string }; level: number }[]) => Object.fromEntries(list.map((c) => [c.card.key, c.level]));
      if (batch.quick.length) {
        setSwipe(startSwipe({ cards: batch.quick.map((c) => c.card), levels: levels(batch.quick), now }));
        setStatus("swiping");
      } else if (batch.normal.length) {
        const median = await getMedianStepMs(db);
        setRun(startRun({ cards: batch.normal.map((c) => c.card), mode: "review", levels: levels(batch.normal), extraPool: batch.pool, clusterSteps: s.clusterSteps, now, medianMs: median, caps: { ...voiceCapabilities(s), write: s.writable ? await readyWriteLangs(batch.normal.map((c) => c.card.lang)) : [] } }));
        setStatus("cluster");
      } else {
        setStatus("empty");
      }
    },
    [db],
  );

  /** `fresh` = bỏ lượt dở, nạp lượt mới; không thì có lượt dở còn hạn sẽ hỏi ôn tiếp. */
  const load = useCallback(async (fresh: boolean | unknown = false) => {
    setStatus("loading");
    setError(null);
    setSummary(null);
    setSwipe(null);
    setRun(null);
    saving.current = false;
    resumable.current = null;
    try {
      const s = await loadLearnSettings(db);
      setSettings(s);
      if (fresh === true) await clearSnapshot(db, SCOPE);
      else {
        const snap = await loadSnapshot<SavedReview>(db, SCOPE);
        if (snap) {
          resumable.current = snap;
          setStatus("resume");
          return;
        }
      }
      const batch = await pickReviewBatch(db, userLang, s, new Date(), reviewed.current, modeChoice.current === "traditional" ? "traditional" : "auto");
      // Bật "Hỏi kiểu ôn" và có thẻ cấp cao đến hạn (chưa chọn trong lần mở màn này): hỏi trước khi bắt đầu
      if (s.askReviewMode && modeChoice.current === null && batch.quick.length > 0) {
        pending.current = { batch, s };
        setChoice({ quick: batch.quickTotal, normal: batch.normalTotal });
        setRemaining(batch.quickTotal + batch.normalTotal);
        setStatus("choose");
        return;
      }
      await begin(batch, s);
    } catch (e: any) {
      setError(e?.message ?? "Có lỗi xảy ra");
      setStatus("error");
    }
  }, [db, userLang, begin]);

  /** Trả lời câu hỏi kiểu ôn: `swipe` giữ lượt đã chọn, `traditional` chọn lại gộp mọi thẻ vào cụm. */
  const chooseMode = useCallback(
    async (mode: "swipe" | "traditional") => {
      const p = pending.current;
      if (!p) return;
      modeChoice.current = mode;
      setStatus("loading");
      try {
        const batch = mode === "swipe" ? p.batch : await pickReviewBatch(db, userLang, p.s, new Date(), reviewed.current, "traditional");
        pending.current = null;
        await begin(batch, p.s);
      } catch (e: any) {
        setError(e?.message ?? "Có lỗi xảy ra");
        setStatus("error");
      }
    },
    [db, userLang, begin],
  );

  useEffect(() => {
    load();
  }, [load]);

  /** Ôn tiếp lượt dở: dựng lại chồng thẻ vuốt hoặc cụm từ snapshot. */
  const resume = useCallback(() => {
    const snap = resumable.current;
    if (!snap) return;
    const { kind, swipe: sw, run: r, session: sess, remaining: rem } = snap.data;
    session.current = sess;
    setRemaining(rem);
    if (kind === "swipe" && sw) {
      setSwipe(sw);
      setStatus("swiping");
    } else if (r) {
      setRun({ ...r, attempt: { ...r.attempt, startedAt: Date.now() } });
      setStatus("cluster");
    }
  }, []);

  const discard = useCallback(() => load(true), [load]);

  // Lưu lượt đang ôn sau mỗi thẻ / bước để thoát giữa chừng vẫn ôn tiếp được
  useEffect(() => {
    if (!session.current) return;
    let data: SavedReview | null = null;
    if (status === "swiping" && swipe && swipe.phase === "swiping") data = { kind: "swipe", swipe, session: session.current, remaining };
    else if (status === "cluster" && run) data = { kind: "cluster", run, session: session.current, remaining };
    if (data) saveSnapshot(db, SCOPE, data).catch(() => {});
  }, [status, swipe, run]);

  const afterSave = useCallback(
    async (result: ReviewSummary) => {
      setSummary(result);
      requestSync();
      rescheduleReminders(db).catch(() => {}); // đã ôn hôm nay thì bỏ nhắc hôm nay
      // Còn thẻ đến hạn (kể cả thẻ vừa quên hẹn ôn lại trong ngày) thì cho "Ôn tiếp"
      try {
        const s = settings ?? (await loadLearnSettings(db));
        const next = await pickReviewBatch(db, userLang, s, new Date(), reviewed.current, modeChoice.current === "traditional" ? "traditional" : "auto");
        setRemaining(next.quickTotal + next.normalTotal);
      } catch {
        setRemaining(0);
      }
      setStatus("saved");
    },
    [db, settings, userLang],
  );

  const save = useCallback(
    async (mode: "quick" | "normal", results: Parameters<typeof saveReviewResult>[1]["results"]) => {
      if (saving.current || !session.current || !settings) return;
      saving.current = true;
      setStatus("saving");
      try {
        const result = await saveReviewResult(db, { sessionId: session.current.id, mode, startedAt: session.current.startedAt, endedAt: Date.now(), results }, settings);
        for (const r of results) reviewed.current.add(r.card.key);
        await clearSnapshot(db, SCOPE);
        await afterSave(result);
      } catch (e: any) {
        saving.current = false;
        setError(e?.message ?? "Không lưu được phiên ôn");
        setStatus("error");
      }
    },
    [db, settings, afterSave],
  );

  // Vuốt hết chồng thẻ thì tự ghi kết quả (không có bước tự chấm)
  useEffect(() => {
    if (status === "swiping" && swipe?.phase === "done") save("quick", swipeResults(swipe));
  }, [status, swipe?.phase]);

  const dispatchSwipe = useCallback((a: SwipeAction) => setSwipe((prev) => (prev ? reduceSwipe(prev, a) : prev)), []);
  const dispatchRun = useCallback((a: Action) => setRun((prev) => (prev ? reduce(prev, a) : prev)), []);

  const finishCluster = useCallback(() => {
    if (run?.phase === "summary") save("normal", reviewResultsFromCluster(resultsOf(run)));
  }, [run, save]);

  return {
    status, swipe, run, summary, remaining, error, settings, userLang, choice, chooseMode,
    question: run ? currentQuestion(run) : undefined,
    swipeCard: (direction: "remember" | "unsure") => dispatchSwipe({ type: "swipe", direction, at: Date.now() }),
    flip: () => dispatchSwipe({ type: "flip", at: Date.now() }),
    undo: () => dispatchSwipe({ type: "undo", at: Date.now() }),
    answer: (value: string) => dispatchRun({ type: "answer", value, at: Date.now() }),
    hint: () => dispatchRun({ type: "hint", at: Date.now() }),
    speech: (transcripts: string[]) => dispatchRun({ type: "speech", transcripts, at: Date.now() }),
    skipSpeak: () => dispatchRun({ type: "fallbackKind", kinds: ["speak"], at: Date.now() }),
    skipListen: () => dispatchRun({ type: "fallbackKind", kinds: ["listenChoose", "dictation"], at: Date.now() }),
    written: (cells: string[][]) => dispatchRun({ type: "written", cells, at: Date.now() }),
    skipWrite: () => dispatchRun({ type: "skipKind", kind: "handwrite", at: Date.now() }),
    next: () => dispatchRun({ type: "next", at: Date.now() }),
    setGrade: (key: string, grade: Grade) => dispatchRun({ type: "setGrade", key, grade }),
    finishCluster,
    resume,
    discard,
    resumeInfo: resumable.current
      ? {
          savedAt: resumable.current.savedAt,
          cards: resumable.current.data.kind === "swipe" ? Object.keys(resumable.current.data.swipe?.cards ?? {}).length : Object.keys(resumable.current.data.run?.cards ?? {}).length,
        }
      : null,
    reload: () => load(true),
  };
};
