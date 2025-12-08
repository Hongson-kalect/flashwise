import { fontFamily } from "@/configs/fonts";
import { textSizes } from "@/configs/size";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { StyleProp, TextStyle } from "react-native";
import AppText from "../AppText";

type BoldTextProps = {
  text: string;
  bold: number[][];
  color?: keyof ReturnType<typeof useTheme>["theme"];
  boldColor?: keyof ReturnType<typeof useTheme>["theme"];
  size?: keyof typeof textSizes | number;
  style?: StyleProp<TextStyle>;
  font: keyof typeof fontFamily;
  boldFont: keyof typeof fontFamily;
};
export const BoldText = (props: BoldTextProps) => {
  const [textElements] = useState<
    {
      text: string;
      bold: boolean;
    }[]
  >(() => getTextArray(props.text, props.bold));

  return (
    <AppText font="MulishBlackItalic">
      {textElements.map((element, index) => (
        <AppText
          key={index}
          font={element.bold ? props.boldFont : props.font}
          color={element.bold ? props.boldColor : props.color}
          size={props.size}
          style={props.style}
        >
          {element.text}
        </AppText>
      ))}
    </AppText>
  );
};

const getTextArray = (text: string, bold: number[][]) => {
  const result = [];
  if (!bold.length) return [{ text, bold: false }];

  for (let i = 0; i < bold.length; i++) {
    const [start, end] = bold[i];

    if (start === end) continue;

    const prevText = text.slice(0, start);
    const boldText = text.slice(start, end);

    result.push(
      { text: prevText, bold: false },
      { text: boldText, bold: true }
    );

    if (!bold[i + 1]) result.push({ text: text.slice(end), bold: false });
  }
  return result;
};
