import { getMyCollection } from "@/database/queries/collections";
import { getMedianStepMs, loadLearnSettings, pickNewCards, saveLearnResult, SaveSummary, LearnSettings } from "@/database/queries/learning";
import { useAppStore } from "@/stores/appStore";
import { requestSync } from "@/services/sync/bus";
import { voiceCapabilities } from "./speechRecognizer";
import { uuidv7 } from "@/utils/uuidv7";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import { Action, currentQuestion, reduce, resultsOf, RunState, startRun } from "./engine";
import { Grade } from "./types";

export type RunStatus = "loading" | "empty" | "error" | "running" | "saving" | "done";

export interface RunMeta {
  collectionName: string;
  /** Nghĩa mới còn lại trong bộ sau cụm này (và bao nhiêu chưa có bản dịch). */
  remaining: number;
  waitingTranslation: number;
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

  const load = useCallback(async () => {
    setStatus("loading");
    setSummary(null);
    setError(null);
    try {
      const [settings, info, median] = await Promise.all([loadLearnSettings(db), getMyCollection(db, userCollectionId), getMedianStepMs(db)]);
      if (!info) throw new Error("Không tìm thấy bộ từ");
      const picked = await pickNewCards(db, userCollectionId, userLang, settings.clusterSize);
      setMeta({ collectionName: info.name, remaining: Math.max(0, picked.available - picked.cards.length), waitingTranslation: picked.waitingTranslation });
      if (!picked.cards.length) {
        setState(null);
        setStatus("empty");
        return;
      }
      const now = Date.now();
      session.current = { id: uuidv7(), collectionId: info.collectionId, startedAt: now, settings };
      setState(startRun({ cards: picked.cards, extraPool: picked.pool, clusterSteps: settings.clusterSteps, now, medianMs: median, caps: voiceCapabilities(settings) }));
      setStatus("running");
    } catch (e: any) {
      setError(e?.message ?? "Có lỗi xảy ra");
      setStatus("error");
    }
  }, [db, userCollectionId, userLang]);

  useEffect(() => {
    load();
  }, [load]);

  const dispatch = useCallback((action: Action) => setState((prev) => (prev ? reduce(prev, action) : prev)), []);

  const answer = useCallback((value: string) => dispatch({ type: "answer", value, at: Date.now() }), [dispatch]);
  const hint = useCallback(() => dispatch({ type: "hint", at: Date.now() }), [dispatch]);
  const speech = useCallback((transcripts: string[]) => dispatch({ type: "speech", transcripts, at: Date.now() }), [dispatch]);
  const skipSpeak = useCallback(() => dispatch({ type: "skipKind", kind: "speak", at: Date.now() }), [dispatch]);
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
      setSummary(result);
      setStatus("done");
      requestSync();
    } catch (e: any) {
      setError(e?.message ?? "Không lưu được phiên học");
      setStatus("error");
    }
  }, [db, state, status]);

  return { status, state, meta, summary, error, question: state ? currentQuestion(state) : undefined, userLang, answer, hint, speech, skipSpeak, known, next, setGrade, finish, reload: load };
};
