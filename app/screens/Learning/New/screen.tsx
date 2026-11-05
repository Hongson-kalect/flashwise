import SessionHeader from "@/components/learning/SessionHeader";
import QuestionView from "@/components/learning/questions";
import StateView from "@/components/learning/StateView";
import SummaryView from "@/components/learning/SummaryView";
import { progressOf } from "@/learning/engine";
import { useLearnRun } from "@/learning/useLearnRun";
import { useTheme } from "@/providers/Theme";
import useUserStateStore from "@/stores/userStateStore";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, Alert, BackHandler, KeyboardAvoidingView, Platform, View } from "react-native";

const AUTO_NEXT_MS = 650;

/**
 * Học từ mới của 1 bộ (param `id` = id UserCollection): 1 cụm vài nghĩa, mỗi nghĩa đi qua các bước (xem thẻ + gõ lại, chọn nghĩa,
 * chọn từ, gõ từ), rồi tổng kết chọn mức nhớ và lưu vào SQLite. Màn chỉ ghép: logic ở learning/, giao diện ở components/learning.
 */
export default function LearnNewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const hearable = useUserStateStore((s) => s.hearable);
  const run = useLearnRun(id);
  const { state, status } = run;

  const leave = useCallback(() => router.back(), []);
  const confirmExit = useCallback(() => {
    if (status !== "running" || !state || state.phase === "summary") return leave();
    Alert.alert("Thoát phiên học?", "Các từ chưa lưu kết quả sẽ không được tính vào tiến độ.", [
      { text: "Ở lại", style: "cancel" },
      { text: "Thoát", style: "destructive", onPress: leave },
    ]);
  }, [status, state, leave]);

  // Nút back của máy cũng hỏi trước khi thoát giữa phiên
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (status === "running" && state && state.phase !== "summary") {
        confirmExit();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [status, state, confirmExit]);

  // Đúng ngay (không gợi ý, không làm lại): tự sang câu kế sau một nhịp ngắn
  const quick = !!state && state.phase === "feedback" && !!state.feedback?.correct && state.feedback.verdict !== "close" && state.attempt.tries === 1 && state.attempt.hints === 0;
  useEffect(() => {
    if (!quick) return;
    const t = setTimeout(run.next, AUTO_NEXT_MS);
    return () => clearTimeout(t);
  }, [quick, state?.doneSteps]);

  useEffect(() => {
    if (status === "done") queryClient.invalidateQueries({ queryKey: ["collections"] });
  }, [status]);

  const body = () => {
    if (status === "loading") {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      );
    }
    if (status === "error") {
      return (
        <StateView
          icon="alert-circle"
          tone="error"
          title="Không bắt đầu được"
          message={run.error ?? undefined}
          actions={[{ label: "Thử lại", onPress: run.reload, primary: true }, { label: "Quay lại", onPress: leave }]}
        />
      );
    }
    if (status === "empty") {
      const waiting = run.meta?.waitingTranslation ?? 0;
      return (
        <StateView
          icon={waiting ? "globe" : "award"}
          tone={waiting ? "warning" : "success"}
          title={waiting ? "Đang chờ bản dịch" : "Hết từ mới"}
          message={
            waiting
              ? `${waiting} từ trong bộ chưa có bản dịch sang ngôn ngữ của bạn nên chưa học được. Mở bộ từ, kéo làm mới sau ít phút rồi quay lại.`
              : "Bạn đã học hết từ mới trong bộ này. Thêm từ vào bộ hoặc chọn bộ khác."
          }
          actions={[{ label: "Quay lại bộ từ", onPress: leave, primary: true }]}
        />
      );
    }
    if (status === "done" && run.summary) {
      const remaining = run.meta?.remaining ?? 0;
      const minutes = Math.max(1, Math.round(run.summary.seconds / 60));
      return (
        <StateView
          icon="check-circle"
          tone="success"
          title="Đã lưu!"
          message={`${run.summary.learned} từ mới${run.summary.known ? ` (${run.summary.known} từ đã biết)` : ""} · +${run.summary.xp} XP · ${minutes} phút. Từ sẽ quay lại ôn theo lịch.`}
          actions={[
            ...(remaining > 0 ? [{ label: `Học cụm tiếp (còn ${remaining} từ)`, onPress: run.reload, primary: true }] : []),
            { label: "Về bộ từ", onPress: leave, primary: remaining === 0 },
          ]}
        />
      );
    }
    if (!state) return null;
    if (state.phase === "summary") {
      return <SummaryView state={state} saving={status === "saving"} onGrade={run.setGrade} onSave={run.finish} />;
    }
    const card = state.current ? state.cards[state.current.cardKey].card : null;
    if (!card || !run.question) return null;
    return (
      <QuestionView
        // key theo bước để ô gõ / trạng thái cục bộ được làm mới ở mỗi câu hỏi
        key={`${state.current!.cardKey}:${state.current!.stepIdx}:${state.current!.pass}`}
        card={card}
        question={run.question}
        attempt={state.attempt}
        feedback={state.feedback}
        hearable={hearable}
        onAnswer={run.answer}
        onHint={run.hint}
        onKnown={run.known}
        onNext={run.next}
      />
    );
  };

  const running = status === "running" && !!state && state.phase !== "summary";
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SessionHeader
        progress={state ? (state.phase === "summary" || status === "done" ? 1 : progressOf(state)) : 0}
        label={running && state ? `${Math.min(state.doneSteps + 1, state.totalSteps)} / ${state.totalSteps}` : undefined}
        onClose={confirmExit}
      />
      {body()}
    </KeyboardAvoidingView>
  );
}
