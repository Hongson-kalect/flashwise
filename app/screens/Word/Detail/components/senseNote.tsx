import AppIcon from "@/components/AppIcon";
import { AppPressable } from "@/components/AppPressable";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import { getNote, saveNote } from "@/database/queries/notes";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { FontAwesome } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useContext, useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Divider } from "react-native-paper";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SenseContext } from "../senseEdit";

const MAX = 1000;

type Props = {
  word: string;
};

/** Ghi chú cá nhân của nghĩa đang xem (chỉ lưu trên máy). Nhấn giữ hoặc chạm để thêm / sửa; để trống rồi lưu = xoá. */
const SenseNote = ({ word }: Props) => {
  const { theme } = useTheme();
  const db = useSQLiteContext();
  const { present, close } = useBottomSheet();
  const sense = useContext(SenseContext);
  const senseId: string | undefined = sense?.id;
  const [note, setNote] = useState("");

  useEffect(() => {
    let alive = true;
    setNote("");
    if (senseId) getNote(db, senseId).then((n) => alive && setNote(n));
    return () => {
      alive = false;
    };
  }, [db, senseId]);

  const save = useCallback(
    async (text: string) => {
      if (!senseId) return;
      await saveNote(db, senseId, text);
      setNote(text.trim());
      close();
    },
    [db, senseId, close],
  );

  const open = () =>
    senseId &&
    present({
      title: note ? "Sửa ghi chú" : "Thêm ghi chú",
      size: "medium",
      render: () => <NoteSheet word={word} initial={note} onSave={save} />,
    });

  return (
    <Animated.View className={"mt-2"} layout={LinearTransition}>
      <View className="flex-row items-center gap-2 h-8">
        <FontAwesome style={{ width: 14 }} name="sticky-note" size={14} color={theme.title} />
        <AppTitle title="Note" />
      </View>
      <Divider style={{ marginBottom: 8 }} />
      {note ? (
        <AppPressable onLongPress={open} onPress={open} className="py-2">
          <AppText size={"sm"} color="subText2" font="MulishRegularItalic">
            {note}
          </AppText>
        </AppPressable>
      ) : (
        <Pressable
          onPress={open}
          disabled={!senseId}
          className="self-start flex-row items-center gap-2 rounded-xl px-3 h-9"
          style={{ backgroundColor: theme.primary + "14" }}
        >
          <AppIcon branch="feather" name="plus" size={16} color={theme.primary} />
          <AppText size="sm" color="primary" weight="semibold">
            Thêm ghi chú
          </AppText>
        </Pressable>
      )}
    </Animated.View>
  );
};

const NoteSheet = ({ word, initial, onSave }: { word: string; initial: string; onSave: (t: string) => void }) => {
  const { theme } = useTheme();
  const [text, setText] = useState(initial);
  const changed = text.trim() !== initial.trim();
  return (
    <View className="px-4 pt-3 gap-4">
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        autoFocus
        maxLength={MAX}
        textAlignVertical="top"
        placeholder={`Ghi chú riêng cho "${word}" (chỉ mình bạn thấy)`}
        placeholderTextColor={theme.subText3}
        style={{
          minHeight: 110,
          color: theme.text,
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 14,
          fontFamily: "MulishRegular",
          fontSize: 16,
        }}
      />
      <Pressable
        disabled={!changed}
        onPress={() => onSave(text)}
        className="h-14 rounded-2xl items-center justify-center"
        style={{ backgroundColor: theme.primary, opacity: changed ? 1 : 0.45 }}
      >
        <AppText color="white" size="lg" weight="bold">
          {text.trim() ? "Lưu ghi chú" : "Xoá ghi chú"}
        </AppText>
      </Pressable>
    </View>
  );
};

export default SenseNote;
