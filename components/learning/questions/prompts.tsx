import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import SenseImage from "@/components/learning/SenseImage";
import WordHeader from "@/components/learning/WordHeader";
import { ClusterStepKind, LearnCard , glossOf } from "@/learning/types";
import { useTheme } from "@/providers/Theme";
import { ComponentType , useEffect } from "react";
import { speakWord } from "@/utils/speak";
import { Pressable, View } from "react-native";
import { PromptProps } from "./types";

/** Che từ đang học trong câu ví dụ (không che được từ biến đổi: giữ nguyên câu). */
const maskWord = (text: string, word: string) => text.replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "_____");

const Label = ({ children }: { children: string }) => (
  <AppText size="sm" weight="semibold" color="subText2" textAlign="center">
    {children}
  </AppText>
);

const Example = ({ card, mask = false, hideNative = false }: { card: LearnCard; mask?: boolean; hideNative?: boolean }) => {
  const { theme } = useTheme();
  if (!card.example) return null;
  return (
    <View className="p-3 rounded-2xl gap-1" style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
      <AppText color="title" style={{ fontStyle: "italic" }}>
        {mask ? maskWord(card.example.text, card.word) : card.example.text}
      </AppText>
      {!!card.example.roman && !mask && (
        <AppText size="sm" color="subText2">
          {card.example.roman}
        </AppText>
      )}
      {!!card.example.native && !mask && !hideNative && (
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
    <View className="gap-3">
      <Label>Từ mới, đọc kỹ rồi gõ lại từ này</Label>
      <WordHeader card={card} autoPlay={hearable} />
      <SenseImage card={card} aspect={16 / 9} />
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
  <View className="gap-3 pt-1">
    <Label>Chọn nghĩa đúng</Label>
    <WordHeader card={card} autoPlay={hearable} />
    {/* Bản dịch ví dụ chứa luôn đáp án nên không hiện ở bước này */}
    <Example card={card} hideNative />
  </View>
);

/** Nhìn định nghĩa / ảnh, chọn từ. */
const ChooseWordPrompt = ({ card }: PromptProps) => (
  <View className="gap-3">
    <Label>Từ nào có nghĩa này?</Label>
    <SenseImage card={card} aspect={16 / 9} />
    <Meaning card={card} big />
    <Example card={card} mask />
  </View>
);

/** Nhìn nghĩa, gõ từ. */
const TypeWordPrompt = ({ card }: PromptProps) => (
  <View className="gap-3">
    <Label>Gõ từ có nghĩa này</Label>
    <SenseImage card={card} aspect={16 / 9} />
    <Meaning card={card} big />
    <Example card={card} mask />
  </View>
);

/** Nút nghe lại / nghe chậm cho bước nghe; tự phát 1 lần khi câu hỏi hiện. */
const ListenControl = ({ card, onSkip }: { card: LearnCard; onSkip: () => void }) => {
  const { theme } = useTheme();
  useEffect(() => {
    speakWord(card);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý: chỉ chạy lại khi phụ thuộc liệt kê đổi (hàm / đối tượng còn lại đổi mỗi lần render hoặc đã ổn định)
  }, [card.key]);
  return (
    <View className="items-center gap-3 py-6">
      <Pressable
        onPress={() => speakWord(card)}
        className="h-28 w-28 rounded-full items-center justify-center"
        style={{ backgroundColor: theme.primary + "14", borderWidth: 2, borderColor: theme.primary }}
        accessibilityLabel="Nghe lại"
      >
        <AppIcon branch="feather" name="volume-2" size={44} color={theme.primary} />
      </Pressable>
      <Pressable onPress={() => speakWord(card, { slow: true })} hitSlop={8} className="flex-row items-center gap-1.5 px-4 h-9 rounded-full" style={{ borderWidth: 1, borderColor: theme.border }}>
        <AppIcon branch="feather" name="rotate-cw" size={14} color={theme.text} />
        <AppText size="sm" weight="semibold" color="subText1">
          Nghe chậm
        </AppText>
      </Pressable>
      <Pressable onPress={onSkip} hitSlop={8}>
        <AppText size="sm" weight="semibold" color="subText2">
          Không tiện nghe, chuyển sang dạng khác
        </AppText>
      </Pressable>
    </View>
  );
};

/** Chỉ có âm thanh, chọn từ nghe được. */
const ListenChoosePrompt = ({ card, onSkipListen }: PromptProps) => (
  <View className="gap-2 pt-4">
    <Label>Nghe và chọn từ đúng</Label>
    <ListenControl card={card} onSkip={onSkipListen} />
  </View>
);

/** Chính tả: nghe rồi gõ lại từ. */
const DictationPrompt = ({ card, onSkipListen }: PromptProps) => (
  <View className="gap-2 pt-4">
    <Label>Nghe và gõ lại từ</Label>
    <ListenControl card={card} onSkip={onSkipListen} />
  </View>
);

/** Nhìn từ và nghĩa, đọc to (nhận dạng ở ô trả lời bên dưới). */
const SpeakPrompt = ({ card }: PromptProps) => (
  <View className="gap-3">
    <Label>Đọc to từ này</Label>
    <WordHeader card={card} />
    <SenseImage card={card} aspect={16 / 9} />
    <Meaning card={card} />
  </View>
);

/** Nhìn nghĩa, viết từ bằng ngón tay (ô vẽ ở phần trả lời bên dưới). */
const HandwritePrompt = ({ card }: PromptProps) => (
  <View className="gap-3">
    <Label>Viết từ có nghĩa này</Label>
    <SenseImage card={card} aspect={16 / 9} />
    <Meaning card={card} big />
  </View>
);

/** Registry: kiểu bước → phần đề. Thêm kiểu bước mới (cloze, nghe, nói...) thì đăng ký thêm ở đây và ở learning/steps.ts. */
export const PROMPTS: Record<ClusterStepKind, ComponentType<PromptProps>> = {
  copy: CopyPrompt,
  chooseMeaning: ChooseMeaningPrompt,
  chooseWord: ChooseWordPrompt,
  typeWord: TypeWordPrompt,
  listenChoose: ListenChoosePrompt,
  dictation: DictationPrompt,
  speak: SpeakPrompt,
  handwrite: HandwritePrompt,
};
