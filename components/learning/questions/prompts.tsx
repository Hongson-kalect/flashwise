import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import SenseImage from "@/components/learning/SenseImage";
import WordHeader from "@/components/learning/WordHeader";
import { LearnCard, StepKind } from "@/learning/types";
import { glossOf } from "@/learning/types";
import { useTheme } from "@/providers/Theme";
import { ComponentType } from "react";
import { Pressable, View } from "react-native";
import { PromptProps } from "./types";

/** Che từ đang học trong câu ví dụ (không che được từ biến đổi: giữ nguyên câu). */
const maskWord = (text: string, word: string) => text.replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "_____");

const Label = ({ children }: { children: string }) => (
  <AppText size="sm" weight="semibold" color="subText2" textAlign="center">
    {children}
  </AppText>
);

const Example = ({ card, mask = false }: { card: LearnCard; mask?: boolean }) => {
  const { theme } = useTheme();
  if (!card.example) return null;
  return (
    <View className="p-3 rounded-2xl gap-1" style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
      <AppText color="title" style={{ fontStyle: "italic" }}>
        {mask ? maskWord(card.example.text, card.word) : card.example.text}
      </AppText>
      {!!card.example.native && !mask && (
        <AppText size="sm" color="subText2">
          {card.example.native}
        </AppText>
      )}
    </View>
  );
};

const Meaning = ({ card, big = false }: { card: LearnCard; big?: boolean }) => (
  <View className="gap-1">
    <AppText size={big ? "2xl" : "lg"} weight="bold" color="title" textAlign="center">
      {glossOf(card)}
    </AppText>
    {!!card.definition && (
      <AppText size="sm" color="subText1" textAlign="center">
        {card.definition}
      </AppText>
    )}
  </View>
);

/** Bước 0: thẻ đầy đủ, gõ lại từ để ghi nhớ; "Đã biết" bỏ cả thẻ (lên thẳng cấp 5). */
const CopyPrompt = ({ card, hearable, onKnown }: PromptProps) => {
  const { theme } = useTheme();
  return (
    <View className="gap-4">
      <Label>Từ mới, đọc kỹ rồi gõ lại từ này</Label>
      <WordHeader card={card} autoPlay={hearable} />
      <SenseImage card={card} height={150} />
      <Meaning card={card} />
      <Example card={card} />
      <Pressable onPress={onKnown} className="self-center flex-row items-center gap-1.5 px-4 h-10 rounded-full" style={{ borderWidth: 1, borderColor: theme.border }}>
        <AppIcon branch="feather" name="check-circle" size={16} color={theme.success} />
        <AppText size="sm" weight="semibold" color="subText1">
          Mình đã biết từ này
        </AppText>
      </Pressable>
    </View>
  );
};

/** Nhìn từ, chọn nghĩa. */
const ChooseMeaningPrompt = ({ card, hearable }: PromptProps) => (
  <View className="gap-5 pt-4">
    <Label>Chọn nghĩa đúng</Label>
    <WordHeader card={card} autoPlay={hearable} />
    <Example card={card} />
  </View>
);

/** Nhìn định nghĩa / ảnh, chọn từ. */
const ChooseWordPrompt = ({ card }: PromptProps) => (
  <View className="gap-4 pt-2">
    <Label>Từ nào có nghĩa này?</Label>
    <SenseImage card={card} height={130} />
    <Meaning card={card} big />
    <Example card={card} mask />
  </View>
);

/** Nhìn nghĩa, gõ từ. */
const TypeWordPrompt = ({ card }: PromptProps) => (
  <View className="gap-4 pt-2">
    <Label>Gõ từ có nghĩa này</Label>
    <SenseImage card={card} height={120} />
    <Meaning card={card} big />
    <Example card={card} mask />
  </View>
);

/** Registry: kiểu bước → phần đề. Thêm kiểu bước mới (cloze, nghe, nói...) thì đăng ký thêm ở đây và ở learning/steps.ts. */
export const PROMPTS: Record<StepKind, ComponentType<PromptProps>> = {
  copy: CopyPrompt,
  chooseMeaning: ChooseMeaningPrompt,
  chooseWord: ChooseWordPrompt,
  typeWord: TypeWordPrompt,
};
