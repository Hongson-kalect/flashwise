import AppText from "@/components/AppText";
import { TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  value?: React.ReactNode;
  editable?: boolean;
  onPress?: () => void;
};
const Information = ({ label, editable, onPress, value }: Props) => (
  <TouchableOpacity
    disabled={!editable}
    onPress={onPress}
    className="flex-row gap-2"
  >
    <AppText
      weight="bold"
      style={{ textDecorationLine: editable ? "underline" : "none" }}
    >
      {label}:
    </AppText>
    <View className="flex-1">
      {value ? (
        typeof value === "string" ? (
          <AppText color="subText2">{value}</AppText>
        ) : (
          value
        )
      ) : (
        <AppText color="subText3">Chưa có</AppText>
      )}
    </View>
  </TouchableOpacity>
);
export default Information;
