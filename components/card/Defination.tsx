import { TextStyle, View, ViewStyle } from "react-native";
import AppText from "../AppText";

type Props = {
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
};

const CardDefination = (props: Props) => {
  return (
    <View className="w-full px-4 mt-1">
      <AppText style={props.textStyle} font="MulishRegular" size={"sm"}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt.
      </AppText>
    </View>
  );
};

export default CardDefination;
