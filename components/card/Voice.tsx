import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import AppButton from "../AppButton";
import AppIcon from "../AppIcon";
import AppText from "../AppText";
import useUserStateStore from "@/stores/userStateStore";

type Props = {
  question: any;
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
};
const CardVoice = (props: Props) => {
  const { setHearable } = useUserStateStore();
  return (
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

      <TouchableOpacity
        className="mt-10 py-4"
        onPress={() => setHearable(false)}
      >
        <AppText
          size={"xs"}
          color="subText2"
          style={{ textDecorationLine: "underline" }}
          font="MulishLightItalic"
        >
          Không thể nghe bây giờ
        </AppText>
      </TouchableOpacity>
    </View>
  );
};
export default CardVoice;
