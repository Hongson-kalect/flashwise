import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  value?: React.ReactNode;
  editable?: boolean;
  onPress?: () => void;
  labelWidth?: number;
  onLabelLayout?: (event: LayoutChangeEvent) => void;
};
const Information = ({
  label,
  editable,
  onPress,
  value,
  labelWidth,
  onLabelLayout,
}: Props) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      disabled={!editable}
      onPress={onPress}
      className="flex-row gap-2"
    >
      <AppText
        weight="bold"
        color="subText2"
        size={"sm"}
        style={{
          width: labelWidth || "auto",
        }}
        onLayout={onLabelLayout}
      >
        {label}
      </AppText>

      <AppText weight="bold" color="subText2" size={"sm"}>
        :
      </AppText>
      <View className="flex-1">
        {value ? (
          typeof value === "string" ? (
            <AppText>{value}</AppText>
          ) : (
            value
          )
        ) : (
          <AppText color="subText3">Chưa có</AppText>
        )}
      </View>

      {editable && (
        <View>
          <TouchableOpacity
            className="px-3 py-1.5 items-center justify-center rounded"
            style={{ backgroundColor: theme.background }}
          >
            <AppIcon
              onPress={onPress}
              name="edit"
              branch="antd"
              size={16}
              color="grey"
            />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};
export default Information;
