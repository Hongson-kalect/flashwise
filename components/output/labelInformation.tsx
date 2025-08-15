import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";
import EditIcon from "../icons/editIcon";

type Props = {
  label: string;
  value?: React.ReactNode;
  onPress?: () => void;
  labelWidth?: number;
  onLabelLayout?: (event: LayoutChangeEvent) => void;
  mode?: "create" | "update" | "view";
};
const LabelInformation = ({
  label,
  onPress,
  value,
  labelWidth,
  onLabelLayout,
  mode = "view",
}: Props) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      disabled={mode === "view"}
      onPress={onPress}
      className="gap-2"
    >
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
      <View className="ml-6 flex-row items-center">
        <View style={{ minHeight: 28 }} className="flex-1">
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
              disabled
              className="px-3 py-1.5 items-center justify-center rounded"
              // style={{ backgroundColor: theme.background }}
            >
              <EditIcon opacity={1} />
              {/* Nếu có dữ liệu rồi thì giảm opacity */}
            </TouchableOpacity>
          </View>
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
