import AppIcon from "@/components/AppIcon";
import AppImage from "@/components/AppImage";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { suggestWords, WordSuggestion } from "@/services/api/words";
import { mediaUrl } from "@/stores/appStore";
import { useDebounce } from "@/ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";

type Props = {
  /** Ngôn ngữ đang học (ngôn ngữ của từ cần thêm). */
  lang: string;
  /** Ngôn ngữ của người dùng (để gõ nghĩa và hiện nghĩa). */
  userLang: string;
  /** Từ đã có trong danh sách (viết thường) để đánh dấu "đã thêm". */
  added: string[];
  onPick: (word: string) => void;
};

const MODES = [
  { key: "word", label: "Gõ từ" },
  { key: "meaning", label: "Gõ nghĩa" },
] as const;

/**
 * Ô thêm từ có gợi ý. "Gõ từ": gõ đầu từ của ngôn ngữ đang học, chọn từ gợi ý kèm nghĩa. "Gõ nghĩa" (thêm ngược): gõ nghĩa bằng tiếng của mình
 * (vd "cái nồi") để tìm từ tương ứng, dùng khi chưa biết từ viết thế nào. Chạm gợi ý để thêm vào danh sách; chỉ gợi ý từ đã có trong hệ thống,
 * từ khác vẫn gõ trực tiếp vào danh sách.
 */
const WordSuggest = ({ lang, userLang, added, onPick }: Props) => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<"word" | "meaning">("word");
  const [q, setQ] = useState("");
  const debounced = useDebounce(q.trim(), 250);
  const enabled = debounced.length >= (mode === "meaning" ? 2 : 1);

  const result = useQuery({
    queryKey: ["word-suggest", mode, lang, userLang, debounced],
    queryFn: () => suggestWords(debounced, lang, userLang, mode),
    enabled,
    retry: false,
    staleTime: 60_000,
  });
  const rows = enabled ? (result.data ?? []) : [];
  const has = new Set(added);

  const pick = (row: WordSuggestion) => {
    onPick(row.value);
    setQ("");
  };

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        {MODES.map((m) => (
          <Pressable
            key={m.key}
            onPress={() => setMode(m.key)}
            className="px-3 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: mode === m.key ? theme.primary : theme.primary + "14" }}
          >
            <AppText size="xs" weight="bold" color={mode === m.key ? "white" : "primary"}>
              {m.label}
            </AppText>
          </Pressable>
        ))}
        <AppText size="xs" color="subText2" style={{ flex: 1 }} numberOfLines={1}>
          {mode === "word" ? `Từ ${lang.toUpperCase()} cần thêm` : `Nghĩa ${userLang.toUpperCase()} → từ ${lang.toUpperCase()}`}
        </AppText>
      </View>
      <View
        className="flex-row items-center px-3 rounded-2xl"
        style={{ backgroundColor: theme.card, borderWidth: 1.5, borderColor: theme.border, height: 48 }}
      >
        <AppIcon branch="feather" name="search" size={16} color={theme.subText2} />
        <TextInput
          value={q}
          onChangeText={setQ}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={mode === "word" ? "Gõ để tìm từ, vd: hou…" : "Gõ nghĩa, vd: cái nồi, cửa, nhà"}
          placeholderTextColor={theme.subText3}
          style={{ flex: 1, color: theme.text, marginLeft: 8, fontFamily: "MulishSemiBold", fontSize: 15 }}
        />
        {result.isFetching && enabled && <ActivityIndicator size="small" color={theme.primary} />}
      </View>

      {rows.length > 0 && (
        <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
          {rows.map((row, i) => {
            const done = has.has(row.value.toLowerCase());
            const img = mediaUrl(row.image_preview);
            return (
              <Pressable
                key={row.id}
                disabled={done}
                onPress={() => pick(row)}
                className="flex-row items-center gap-3 px-3 py-2"
                style={{ borderTopWidth: i ? 1 : 0, borderTopColor: theme.border, opacity: done ? 0.5 : 1 }}
              >
                <View style={{ height: 40, width: 40, borderRadius: 10, overflow: "hidden", backgroundColor: theme.primary + "14" }}>
                  {img ? <AppImage source={{ uri: img }} style={{ width: "100%", height: "100%" }} /> : null}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <AppText weight="bold" color="title" numberOfLines={1} style={{ flexShrink: 1 }}>
                      {row.value}
                    </AppText>
                    {!!row.pos && (
                      <AppText size="xs" color="subText2">
                        {row.pos}
                      </AppText>
                    )}
                  </View>
                  {!!row.gloss && (
                    <AppText size="sm" color="subText1" numberOfLines={1}>
                      {row.gloss}
                    </AppText>
                  )}
                </View>
                <AppIcon branch="feather" name={done ? "check" : "plus-circle"} size={20} color={done ? theme.success : theme.primary} />
              </Pressable>
            );
          })}
        </View>
      )}
      {enabled && !result.isFetching && !result.isError && rows.length === 0 && (
        <AppText size="xs" color="subText2">
          {mode === "meaning"
            ? "Chưa có từ nào khớp nghĩa này trong hệ thống. Thử cách diễn đạt khác, hoặc gõ thẳng từ vào danh sách bên dưới."
            : "Chưa thấy từ này trong hệ thống, bạn vẫn có thể gõ thẳng vào danh sách bên dưới để tạo mới."}
        </AppText>
      )}
    </View>
  );
};

export default WordSuggest;
