import { StyleProp, ViewStyle } from "react-native";
import AppText from "./AppText";

type Props = {
  title: string;
  style?: StyleProp<ViewStyle>;
};
const AppTitle = ({ title, style }: Props) => {
  return (
    <AppText
      color="title"
      style={[
        {
          fontSize: 24,
          fontWeight: "bold",
          // textAlign: "center",
          marginVertical: 20,
        },
        style,
      ]}
    >
      {title}
    </AppText>
  );
};

export default AppTitle;
