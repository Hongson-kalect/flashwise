import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { speechDiagnostics, useSpeechRecognizer } from "@/learning/speechRecognizer";
import { useTheme } from "@/providers/Theme";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

/** Màn thử giọng nói: kiểm tra micro + dịch vụ nhận dạng của máy mà không cần vào phiên học. Chạm mic để nói, chạm lần nữa để dừng. */
const LANGS = [
  { code: "en", label: "Tiếng Anh", sample: "hello" },
  { code: "vi", label: "Tiếng Việt", sample: "xin chào" },
] as const;

const VoiceTestScreen = () => {
  const { theme } = useTheme();
  const [lang, setLang] = useState<(typeof LANGS)[number]>(LANGS[0]);
  const [onDevice, setOnDevice] = useState(false);
  const [results, setResults] = useState<string[][]>([]);
  const diag = useMemo(() => speechDiagnostics(), []);
  const rec = useSpeechRecognizer(lang.code, (t) => setResults((r) => [t, ...r].slice(0, 5)), undefined, onDevice);
  const listening = rec.status === "listening";

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppReturnHeader title="Thử giọng nói" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View className="flex-row gap-2">
          {LANGS.map((l) => (
            <Pressable
              key={l.code}
              onPress={() => setLang(l)}
              className="px-4 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: l.code === lang.code ? theme.primary : theme.card, borderWidth: 1, borderColor: theme.border }}
            >
              <AppText size="sm" weight="semibold" style={{ color: l.code === lang.code ? "#fff" : theme.text }}>
                {l.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => setOnDevice((v) => !v)}
          className="flex-row items-center gap-2 self-start px-3 h-9 rounded-full"
          style={{ borderWidth: 1, borderColor: theme.border, backgroundColor: onDevice ? theme.primary + "22" : theme.card }}
        >
          <AppIcon branch="feather" name={onDevice ? "check-square" : "square"} size={16} color={theme.primary} />
          <AppText size="sm">Nhận dạng ngay trên máy (on-device)</AppText>
        </Pressable>

        <AppText size="sm" color="subText1">
          Đọc to: “{lang.sample}”
        </AppText>

        <View style={{ alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={() => (listening ? rec.stop() : rec.start())}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: listening ? theme.error : theme.primary + "22",
              borderWidth: 2,
              borderColor: listening ? theme.error : theme.primary,
            }}
          >
            <AppIcon branch="feather" name={listening ? "square" : "mic"} size={32} color={listening ? "#fff" : theme.primary} />
          </Pressable>
          <AppText size="sm" color="subText1">
            {listening ? "Đang nghe, bạn nói đi..." : "Chạm micro để bắt đầu"}
          </AppText>
          <AppText weight="bold" size="xl" textAlign="center">
            {rec.heard || " "}
          </AppText>
          {rec.message && (
            <AppText size="sm" textAlign="center" style={{ color: theme.error }}>
              {rec.message}
            </AppText>
          )}
        </View>

        {results.length > 0 && (
          <View style={{ gap: 6 }}>
            <AppText size="sm" weight="semibold" color="title">
              Kết quả chốt gần đây
            </AppText>
            {results.map((r, i) => (
              <AppText key={i} size="sm">
                {r[0]}
                {r.length > 1 ? `   (${r.slice(1).join(" · ")})` : ""}
              </AppText>
            ))}
          </View>
        )}

        <View style={{ gap: 4, padding: 12, borderRadius: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
          <AppText size="sm" weight="semibold" color="title">
            Thông tin máy
          </AppText>
          <AppText size="xs">Trạng thái: {rec.status}</AppText>
          <AppText size="xs">Hệ thống báo hỗ trợ: {String(diag.nativeAvailable)}</AppText>
          <AppText size="xs">Dịch vụ mặc định: {diag.defaultService || "(chưa chọn)"}</AppText>
          <AppText size="xs">Dịch vụ app dùng: {diag.usable === null ? "(không có)" : diag.usable || "(mặc định của máy)"}</AppText>
          <AppText size="xs">Dịch vụ tìm thấy: {diag.listed.join(", ") || "(không có)"}</AppText>
          <AppText size="xs">Bước nói trong phiên học: {diag.available ? "bật" : "tắt (máy không hỗ trợ)"}</AppText>
        </View>
      </ScrollView>
    </View>
  );
};

export default VoiceTestScreen;
