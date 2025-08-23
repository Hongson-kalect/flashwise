import { TextStyle } from "react-native";
import AppText from "../AppText";

const HightlightText = ({
  text,
  highlight,
  style,
}: {
  text: string;
  highlight: string;
  style?: TextStyle;
}) => {
  return (
    <AppText style={style}>
      {text.split(" ").map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <AppText key={index} font="MulishBold" color="primary">
            {part + " "}
          </AppText>
        ) : (
          <AppText color="subText2" key={index}>
            {part + " "}
          </AppText>
        )
      )}
    </AppText>
  );
};

export default HightlightText;
