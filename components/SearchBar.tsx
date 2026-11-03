import { useTheme } from "@/providers/Theme";
import { Pressable, TextInput, TextInputProps, View } from "react-native";
import AppIcon from "./AppIcon";

type Props = Pick<TextInputProps, "onSubmitEditing" | "autoFocus"> & {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  /** Nút bên phải (lọc, sắp xếp...). */
  right?: React.ReactNode;
};

/** Ô tìm kiếm chuẩn: card + viền, icon kính lúp, nút xoá khi có chữ. */
const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Tìm kiếm...",
  right,
  onSubmitEditing,
  autoFocus,
}: Props) => {
  const { theme } = useTheme();
  return (
    <View
      className="flex-row items-center gap-3 px-4 h-12 rounded-2xl"
      style={{
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <AppIcon branch="feather" name="search" size={18} color={theme.subText2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.subText3}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
        style={{
          flex: 1,
          color: theme.text,
          fontFamily: "MulishRegular",
          fontSize: 16,
          paddingVertical: 0,
        }}
      />
      {!!value && (
        <Pressable hitSlop={10} onPress={() => onChangeText("")}>
          <AppIcon branch="feather" name="x" size={18} color={theme.subText2} />
        </Pressable>
      )}
      {right}
    </View>
  );
};

export default SearchBar;
