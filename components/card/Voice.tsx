import { TextStyle, View, ViewStyle } from "react-native";
import AppButton from "../AppButton";
import AppIcon from "../AppIcon";

type Props = {
  question: any;
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
};
const CardVoice = (props: Props) => (
  <View style={{ alignItems: "center" }}>
    <AppButton onPress={() => {}} style={{ borderRadius: 24 }}>
      <View
        // activeOpacity={0.8}
        style={{
          height: 180,
          alignItems: "center",
          justifyContent: "center",
          width: 180,
          borderRadius: 24,
          padding: 8,
        }}
      >
        <AppIcon branch="feather" name="volume-2" color="white" size={100} />
      </View>
    </AppButton>
  </View>
);
export default CardVoice;
