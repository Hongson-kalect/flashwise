import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { MAX_HINTS } from "@/learning/engine";
import { baseLang, writeChars } from "@/learning/handwriting";
import { inkRecognize, InkStroke } from "@/modules/expo-ink-recognition";
import { useTheme } from "@/providers/Theme";
import { useEffect, useState } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import InkCanvas from "./InkCanvas";
import { AnswerProps } from "./types";

const GAP = 10;

/**
 * Viết từ bằng ngón tay: mỗi ký tự một ô, nhận dạng trên máy khi bấm Kiểm tra. Gợi ý hiện ký tự mờ làm mẫu, gợi ý cuối hiện đáp án.
 * Đúng ở phương án đầu = tốt; đúng trong top 3 = Khó (nét ngón tay hay lệch). Không viết được thì "Không viết được lúc này" bỏ các bước viết còn lại.
 */
const HandwriteAnswer = ({ card, question, attempt, onWritten, onHint, onSkipWrite }: AnswerProps) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const chars = writeChars(question.answer);
  const size = Math.min(150, Math.floor((width - 32 - GAP * (chars.length - 1)) / chars.length));
  const [cells, setCells] = useState<InkStroke[][]>(() => chars.map(() => []));
  const [busy, setBusy] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const wrong = attempt.lastVerdict === "wrong" && attempt.tries > 0;
  const ready = cells.every((c) => c.length > 0);
  const last = attempt.hints >= MAX_HINTS;

  // Viết sai thì xoá ô để viết lại
  useEffect(() => {
    if (wrong) setCells(chars.map(() => []));
  }, [attempt.tries]);

  const setCell = (i: number, strokes: InkStroke[]) => setCells((prev) => prev.map((c, j) => (j === i ? strokes : c)));

  const submit = async () => {
    if (!ready || busy) return;
    setBusy(true);
    const lang = baseLang(card.lang);
    const results = await Promise.all(cells.map((strokes) => inkRecognize(lang, strokes, size, size)));
    setBusy(false);
    setHeard(results.map((r) => r[0] ?? "?").join(""));
    onWritten(results);
  };

  return (
    <View className="items-center gap-3">
      <View className="min-h-[24px] items-center justify-center">
        {wrong ? (
          <AppText size="sm" textAlign="center" style={{ color: theme.error }}>
            {heard ? `Nhận dạng được "${heard}", chưa đúng. Viết lại nhé` : "Chưa đúng, viết lại nhé"}
          </AppText>
        ) : (
          <AppText size="sm" color="subText2" textAlign="center">
            Viết từng ký tự vào mỗi ô
          </AppText>
        )}
      </View>
      <View className="flex-row" style={{ gap: GAP }}>
        {chars.map((ch, i) => (
          <View key={`${attempt.tries}-${i}`} className="items-center gap-1">
            <InkCanvas
              size={size}
              strokes={cells[i]}
              onChange={(s) => setCell(i, s)}
              ghost={attempt.hints > 0 ? ch : undefined}
              ghostOpacity={attempt.hints >= 2 ? 0.28 : 0.14}
              disabled={busy}
              borderColor={wrong ? theme.error : undefined}
            />
            <Pressable onPress={() => setCell(i, [])} hitSlop={8} disabled={!cells[i].length} style={{ opacity: cells[i].length ? 1 : 0.3 }}>
              <AppIcon branch="feather" name="rotate-ccw" size={16} color={theme.subText2} />
            </Pressable>
          </View>
        ))}
      </View>
      <View className="flex-row gap-3 self-stretch">
        <Pressable onPress={onHint} className="flex-row items-center justify-center gap-1.5 px-4 h-12 rounded-2xl" style={{ borderWidth: 1.5, borderColor: theme.border }}>
          <AppIcon branch="feather" name="help-circle" size={16} color={theme.text} />
          <AppText size="sm" weight="semibold" color="title">
            {last ? "Xem đáp án" : "Gợi ý"}
          </AppText>
        </Pressable>
        <Pressable
          onPress={submit}
          disabled={!ready || busy}
          className="flex-1 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: theme.primary, opacity: ready && !busy ? 1 : 0.45 }}
        >
          <AppText color="white" weight="bold">
            {busy ? "Đang nhận dạng..." : "Kiểm tra"}
          </AppText>
        </Pressable>
      </View>
      <Pressable onPress={onSkipWrite} hitSlop={8}>
        <AppText size="sm" weight="semibold" color="subText2">
          Không viết được lúc này
        </AppText>
      </Pressable>
    </View>
  );
};

export default HandwriteAnswer;
