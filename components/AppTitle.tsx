import { StyleProp, TextStyle } from "react-native";
import AppText from "./AppText";

type Props = {
  title: string;
  onPress?: () => void;
  underline?: boolean;
  style?: StyleProp<TextStyle>;
};
const AppTitle = ({ title, style, ...props }: Props) => {
  return (
    <AppText
      color="title"
      style={[
        {
          fontSize: 20,
          fontWeight: "bold",
          lineHeight: 20 * 1.4,
          textDecorationLine: props.underline ? "underline" : "none",
        },
        style,
      ]}
    >
      {title}
    </AppText>
  );
};

export default AppTitle;
