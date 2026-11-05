import SessionHeader from "@/components/learning/SessionHeader";
import QuestionView from "@/components/learning/questions";
import StateView from "@/components/learning/StateView";
import SummaryView from "@/components/learning/SummaryView";
import SwipeDeck from "@/components/learning/swipe/SwipeDeck";
import { progressOf } from "@/learning/engine";
import { swipeProgress } from "@/learning/swipe";
import { useAutoAdvance } from "@/learning/useAutoAdvance";
import { useReviewRun } from "@/learning/useReviewRun";
import { useTheme } from "@/providers/Theme";
import useUserStateStore from "@/stores/userStateStore";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, Alert, BackHandler, KeyboardAvoidingView, Platform, View } from "react-native";

/**
 * Ôn tập thẻ đến hạn: thẻ cấp cao ôn bằng vuốt (nhanh), thẻ cấp thấp theo cụm; xong 1 lượt thì ghi kết quả và hỏi ôn tiếp.
 * Màn chỉ ghép: logic ở learning/, giao diện ở components/learning.
 */
export default function ReviewScreen() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const hearable = useUserStateStore((s) => s.hearable);
  const r = useReviewRun();
  const { status, swipe, run } = r;
  useAutoAdvance(run, r.next);

  const midSession = (status === "swiping" && swipe?.phase === "swiping") || (status === "cluster" && run?.phase !== "summary");
  const leave = useCallback(() => router.back(), []);
  const confirmExit = useCallback(() => {
    if (!midSession) return leave();
    Alert.alert("Thoát phiên ôn?", "Kết quả chưa lưu chưa được tính, thẻ vẫn đến hạn ôn. Lượt này được giữ 1 giờ, vào lại để ôn tiếp.", [
      { text: "Ở lại", style: "cancel" },
      { text: "Thoát", style: "destructive", onPress: leave },
    ]);
  }, [midSession, leave]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (midSession) {
        confirmExit();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [midSession, confirmExit]);

  useEffect(() => {
    if (status === "saved") queryClient.invalidateQueries({ queryKey: ["home"] });
    if (status === "saved") queryClient.invalidateQueries({ queryKey: ["collections"] });
  }, [status]);

  const body = () => {
    if (status === "loading" || status === "saving") {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      );
    }
    if (status === "error") {
      return (
        <StateView icon="alert-circle" tone="error" title="Không bắt đầu được" message={r.error ?? undefined} actions={[{ label: "Thử lại", onPress: r.reload, primary: true }, { label: "Quay lại", onPress: leave }]} />
      );
    }
    if (status === "resume") {
      const info = r.resumeInfo;
      const minutes = info ? Math.max(1, Math.round((Date.now() - info.savedAt) / 60000)) : 0;
      return (
        <StateView
          icon="rotate-ccw"
          tone="warning"
          title="Bạn còn một lượt ôn dở"
          message={info ? `Lượt ${info.cards} thẻ, dừng cách đây ${minutes} phút. Ôn tiếp hay nạp lượt mới?` : undefined}
          actions={[{ label: "Ôn tiếp", onPress: r.resume, primary: true }, { label: "Nạp lượt mới", onPress: r.discard }]}
        />
      );
    }
    if (status === "empty") {
      return (
        <StateView icon="sun" tone="success" title="Hôm nay đã ôn xong" message="Không còn thẻ nào đến hạn. Học thêm từ mới hoặc quay lại sau." actions={[{ label: "Về trang chủ", onPress: leave, primary: true }]} />
      );
    }
    if (status === "saved" && r.summary) {
      const { reviewed, remembered, forgotten, xp } = r.summary;
      return (
        <StateView
          icon="check-circle"
          tone="success"
          title="Đã lưu!"
          message={`${reviewed} thẻ: nhớ ${remembered}, quên ${forgotten} · +${xp} XP.${forgotten ? " Thẻ quên sẽ quay lại ôn sớm." : ""}`}
          actions={[
            ...(r.remaining > 0 ? [{ label: `Ôn tiếp (còn ${r.remaining} thẻ)`, onPress: r.reload, primary: true }] : []),
            { label: "Xong", onPress: leave, primary: r.remaining === 0 },
          ]}
        />
      );
    }
    if (status === "swiping" && swipe?.current) {
      return <SwipeDeck state={swipe} directionSetting={r.settings?.swipeDirection ?? "left_remember"} onSwipe={r.swipeCard} onFlip={r.flip} onUndo={r.undo} />;
    }
    if (status === "cluster" && run) {
      if (run.phase === "summary") return <SummaryView state={run} saving={false} onGrade={r.setGrade} onSave={r.finishCluster} />;
      const card = run.current ? run.cards[run.current.cardKey].card : null;
      if (!card || !r.question) return null;
      return (
        <QuestionView
          key={`${run.current!.cardKey}:${run.current!.stepIdx}:${run.current!.pass}`}
          card={card}
          question={r.question}
          attempt={run.attempt}
          feedback={run.feedback}
          hearable={hearable}
          onAnswer={r.answer}
          onHint={r.hint}
          onSpeech={r.speech}
          onSkipSpeak={r.skipSpeak}
          onWritten={r.written}
          onSkipWrite={r.skipWrite}
          onKnown={() => {}}
          onNext={r.next}
        />
      );
    }
    return null;
  };

  const progress = swipe && status === "swiping" ? swipeProgress(swipe) : run && status === "cluster" ? progressOf(run) : status === "saved" ? 1 : 0;
  const label = status === "swiping" && swipe ? `${Math.min(swipe.finalized + 1, swipe.total)} / ${swipe.total}` : status === "cluster" && run && run.phase !== "summary" ? `${Math.min(run.doneSteps + 1, run.totalSteps)} / ${run.totalSteps}` : undefined;
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SessionHeader progress={progress} label={label} onClose={confirmExit} />
      {body()}
    </KeyboardAvoidingView>
  );
}
