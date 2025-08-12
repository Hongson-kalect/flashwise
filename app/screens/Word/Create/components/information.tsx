import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  value?: React.ReactNode;
  onPress?: () => void;
  labelWidth?: number;
  mode?: "create" | "update" | "view";
  onLabelLayout?: (event: LayoutChangeEvent) => void;
  icon?: React.ReactNode;
};
const Information = ({
  label,
  mode = "view",
  onPress,
  value,
  labelWidth,
  onLabelLayout,
  icon,
}: Props) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      disabled={mode !== "create"}
      onPress={onPress}
      style={{
        minHeight: 28,
      }}
      className="flex-row gap-2"
    >
      <View className="flex-row gap-1 items-center h-6">
        {icon && <View style={{ width: 14 }}>{icon}</View>}

        <AppText
          weight="100"
          color="subText2"
          size={"sm"}
          style={
            labelWidth
              ? {
                  width: labelWidth || "auto",
                }
              : {}
          }
          onLayout={onLabelLayout}
        >
          {label}
        </AppText>
      </View>

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

      {mode !== "view" && (
        <View>
          <TouchableOpacity
            onPress={onPress}
            className="px-3 py-1.5 items-center justify-center rounded"
            style={{ backgroundColor: theme.background }}
          >
            <AppIcon
              onPress={onPress}
              name="edit"
              branch="antd"
              size={16}
              color={theme.secondary}
            />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};
export default Information;
