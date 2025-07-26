import { StyleProp, TextStyle } from "react-native";
import AppText from "./AppText";

type Props = {
  title: string;
  style?: StyleProp<TextStyle>;
};
const AppTitle = ({ title, style }: Props) => {
  return (
    <AppText
      color="title"
      style={[
        {
          fontSize: 24,
          fontWeight: "bold",
          lineHeight: 24 * 1.4,
          // textAlign: "center",
        },
        style,
      ]}
    >
      {title}
    </AppText>
  );
};

export default AppTitle;
