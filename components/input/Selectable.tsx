import { useTheme } from "@/providers/Theme";
import { Pressable, View } from "react-native";
import AppCheckbox from "../AppCheckbox";

type Props = {
  children: React.ReactNode;
  isSelected?: boolean;
  onSelect: (selected: boolean) => void;
  defaultSelected?: boolean;
  type?: string;
  noFill?: boolean;
};

const Selectable = (props: Props) => {
  const { theme } = useTheme();

  const handleToggle = () => {
    props.onSelect(!props.isSelected);
  };

  return (
    <Pressable
      style={{
        width: "100%",
        borderWidth: 1,
        borderColor: props.noFill
          ? "transparent"
          : props.isSelected
          ? theme.primary
          : "transparent",
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 4,
        backgroundColor: props.noFill
          ? "transparent"
          : props.isSelected
          ? theme.primary + "10"
          : "transparent",
      }}
      onPress={handleToggle}
      className="flex-row gap-4 items-center min-h-12"
    >
      <View className="p-2">
        <AppCheckbox checked={!!props.isSelected} onChange={handleToggle} />
      </View>
      <View className="flex-1">{props.children}</View>
    </Pressable>
  );
};

export default Selectable;
