import { getMedianStepMs, loadLearnSettings, LearnSettings } from "@/database/queries/learning";
import { pickReviewBatch, reviewResultsFromCluster, ReviewSummary, saveReviewResult } from "@/database/queries/review";
import { useAppStore } from "@/stores/appStore";
import { uuidv7 } from "@/utils/uuidv7";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import { Action, currentQuestion, reduce, resultsOf, RunState, startRun } from "./engine";
import { reduceSwipe, startSwipe, SwipeAction, SwipeState, swipeResults } from "./swipe";
import { Grade } from "./types";

export type ReviewStatus = "loading" | "empty" | "swiping" | "cluster" | "saving" | "saved" | "error";

/**
 * Nối phiên ôn tập với SQLite: lấy lượt thẻ đến hạn, thẻ cấp cao ôn bằng vuốt trước (nhanh), rồi thẻ cấp thấp theo cụm.
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

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setSummary(null);
    setSwipe(null);
    setRun(null);
    saving.current = false;
    try {
      const s = await loadLearnSettings(db);
      setSettings(s);
      const batch = await pickReviewBatch(db, userLang, s);
      setRemaining(batch.quickTotal + batch.normalTotal);
      const now = Date.now();
      session.current = { id: uuidv7(), startedAt: now };
      const levels = (list: { card: { key: string }; level: number }[]) => Object.fromEntries(list.map((c) => [c.card.key, c.level]));
      if (batch.quick.length) {
        setSwipe(startSwipe({ cards: batch.quick.map((c) => c.card), levels: levels(batch.quick), now }));
        setStatus("swiping");
      } else if (batch.normal.length) {
        const median = await getMedianStepMs(db);
        setRun(startRun({ cards: batch.normal.map((c) => c.card), mode: "review", levels: levels(batch.normal), extraPool: batch.pool, clusterSteps: s.clusterSteps, now, medianMs: median }));
        setStatus("cluster");
      } else {
        setStatus("empty");
      }
    } catch (e: any) {
      setError(e?.message ?? "Có lỗi xảy ra");
      setStatus("error");
    }
  }, [db, userLang]);

  useEffect(() => {
    load();
  }, [load]);

  const afterSave = useCallback(
    async (result: ReviewSummary) => {
      setSummary(result);
      // Còn thẻ đến hạn (kể cả thẻ vừa quên hẹn ôn lại trong ngày) thì cho "Ôn tiếp"
      try {
        const s = settings ?? (await loadLearnSettings(db));
        const next = await pickReviewBatch(db, userLang, s);
        setRemaining(next.quick.length + next.normal.length);
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
    status, swipe, run, summary, remaining, error, settings, userLang,
    question: run ? currentQuestion(run) : undefined,
    swipeCard: (direction: "remember" | "unsure") => dispatchSwipe({ type: "swipe", direction, at: Date.now() }),
    flip: () => dispatchSwipe({ type: "flip", at: Date.now() }),
    undo: () => dispatchSwipe({ type: "undo", at: Date.now() }),
    answer: (value: string) => dispatchRun({ type: "answer", value, at: Date.now() }),
    hint: () => dispatchRun({ type: "hint", at: Date.now() }),
    next: () => dispatchRun({ type: "next", at: Date.now() }),
    setGrade: (key: string, grade: Grade) => dispatchRun({ type: "setGrade", key, grade }),
    finishCluster,
    reload: load,
  };
};
