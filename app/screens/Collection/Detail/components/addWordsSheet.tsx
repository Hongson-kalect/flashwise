import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { addWordsToCollection } from "@/services/api/collections";
import { useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";
import toast from "@/utils/toast";

type Props = { userCollectionId: string; userLang: string; onDone: () => void };

const splitWords = (text: string) =>
  Array.from(new Set(text.split(/[\n,;]+/).map((w) => w.trim()).filter(Boolean)));

/** Thêm từ vào bộ của mình: gõ nhiều từ (phân cách bằng dòng mới hoặc dấu phẩy). Server chọn nghĩa tốt nhất, từ lạ đi qua AI. */
const AddWordsSheet = ({ userCollectionId, userLang, onDone }: Props) => {
  const { theme } = useTheme();
  const { close } = useBottomSheet();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const words = splitWords(text);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await addWordsToCollection(userCollectionId, words, userLang);
      onDone();
      if (res.unavailable?.length) {
        toast.warning(`Chưa có nghĩa cho: ${res.unavailable.slice(0, 5).join(", ")}`, { long: true });
      }
      close();
    } catch (e: any) {
      const code = e?.response?.data?.errorCode;
      setError(
        !e?.response
          ? "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại."
          : code === "bulk_quota_exceeded"
            ? "Hôm nay bạn đã thêm đủ số từ mới cho phép."
            : e.response.status === 400
              ? "Danh sách từ chưa hợp lệ (tối đa 100 từ mỗi lần)."
              : "Có lỗi xảy ra, thử lại sau.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="gap-3 pb-6 px-4">
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        autoFocus
        autoCapitalize="none"
        placeholder={"Mỗi từ một dòng hoặc cách nhau bằng dấu phẩy\nvd: walk, ticket, luggage"}
        placeholderTextColor={theme.subText3}
        style={{
          color: theme.text,
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1.5,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingTop: 14,
          minHeight: 120,
          textAlignVertical: "top",
          fontFamily: "MulishSemiBold",
          fontSize: 16,
        }}
      />
      {!!error && (
        <AppText size="sm" style={{ color: theme.error }}>
          {error}
        </AppText>
      )}
      <Pressable
        disabled={!words.length || busy}
        onPress={submit}
        className="h-14 rounded-2xl items-center justify-center flex-row gap-2"
        style={{ backgroundColor: theme.primary, opacity: words.length && !busy ? 1 : 0.45 }}
      >
        {busy && <ActivityIndicator color="white" />}
        <AppText color="white" size="lg" weight="bold">
          {busy ? "Đang thêm..." : words.length ? `Thêm ${words.length} từ` : "Thêm từ"}
        </AppText>
      </Pressable>
    </View>
  );
};

export default AddWordsSheet;
