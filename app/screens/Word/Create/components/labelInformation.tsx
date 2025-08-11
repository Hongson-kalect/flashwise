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
const LabelInformation = ({
  label,
  editable,
  onPress,
  value,
  labelWidth,
  onLabelLayout,
}: Props) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity disabled={!editable} onPress={onPress} className="gap-2">
      <AppText
        weight="100"
        color="subText2"
        size={"sm"}
        style={
          labelWidth
            ? {
                width: labelWidth || 32,
              }
            : {}
        }
        onLayout={onLabelLayout}
      >
        {label}:
      </AppText>

      {/* <AppText weight="bold" color="subText2" size={"sm"}>
        :
      </AppText> */}
      <View className=" ml-6">
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

      {/* {editable && (
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
              color={theme.secondary}
            />
          </TouchableOpacity>
        </View>
      )} */}
    </TouchableOpacity>
  );
};
export default LabelInformation;
