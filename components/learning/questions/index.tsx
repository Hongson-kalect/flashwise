import { Attempt, Feedback } from "@/learning/engine";
import { LearnCard, Question } from "@/learning/types";
import { ComponentType } from "react";
import { ScrollView, View } from "react-native";
import FeedbackBar from "../FeedbackBar";
import ChoiceList from "./ChoiceList";
import { PROMPTS } from "./prompts";
import HandwriteAnswer from "./HandwriteAnswer";
import SpeakAnswer from "./SpeakAnswer";
import TypeAnswer from "./TypeAnswer";
import { AnswerProps } from "./types";

/** Registry: cách trả lời → component (chọn / gõ). Thêm cách trả lời mới (nói, ghép chữ...) thì đăng ký ở đây. */
const ANSWERS: Record<Question["answerType"], ComponentType<AnswerProps>> = {
  choose: ChoiceList,
  type: TypeAnswer,
  speak: SpeakAnswer,
  draw: HandwriteAnswer,
};

type Props = {
  card: LearnCard;
  question: Question;
  attempt: Attempt;
  feedback: Feedback | null;
  hearable: boolean;
  onAnswer: (value: string) => void;
  onHint: () => void;
  onSpeech: (transcripts: string[]) => void;
  onSkipSpeak: () => void;
  onWritten: (cells: string[][]) => void;
  onSkipWrite: () => void;
  onKnown: () => void;
  onNext: () => void;
};

/** Khung 1 câu hỏi: phần đề (cuộn được) ở trên, ô trả lời hoặc thanh kết quả ở dưới. Chọn component theo registry. */
const QuestionView = ({ card, question, attempt, feedback, hearable, onAnswer, onHint, onSpeech, onSkipSpeak, onWritten, onSkipWrite, onKnown, onNext }: Props) => {
  const Prompt = PROMPTS[question.kind];
  const Answer = ANSWERS[question.answerType];
  return (
    <View className="flex-1">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 4 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Prompt card={card} question={question} attempt={attempt} hearable={hearable} onKnown={onKnown} />
      </ScrollView>
      <View className="px-4 pb-3 pt-1 gap-2">
        {(!feedback || question.answerType === "choose") && (
          <Answer card={card} question={question} attempt={attempt} feedback={feedback} onAnswer={onAnswer} onHint={onHint} onSpeech={onSpeech} onSkipSpeak={onSkipSpeak} onWritten={onWritten} onSkipWrite={onSkipWrite} />
        )}
        {feedback && <FeedbackBar feedback={feedback} onNext={onNext} />}
      </View>
    </View>
  );
};

export default QuestionView;
