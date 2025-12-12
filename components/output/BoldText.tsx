import { fontFamily } from "@/configs/fonts";
import { textSizes } from "@/configs/size";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { StyleProp, TextStyle } from "react-native";
import AppText from "../AppText";

type BoldTextProps = {
  text: string;
  bold: number[][] | string;
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

const getTextArray = (text: string, bold: number[][] | string) => {
  if (!bold.length) return [{ text, bold: false }];

  // Xác định vị trí bold nếu truyền vào là string
  if (typeof bold === "string") {
    const customBold = extractBoldIndex(text, bold);
    return getBoldText(text, customBold);
    // return result
  } else {
    return getBoldText(text, bold);
  }
};

const extractBoldIndex = (text: string, bold: string) => {
  const result: number[][] = [];
  const lowercase = text.toLowerCase();
  const boldLowercase = bold.toLowerCase();

  const parts = lowercase.split(boldLowercase);

  let currentIndex = 0;
  const boldLength = boldLowercase.length;

  parts.forEach((part, index) => {
    if (index) {
      result.push([currentIndex, currentIndex + boldLength]);
      currentIndex += boldLength;
    }

    currentIndex += part.length;

    // result.push({ text: part, bold:false });
    // if(index !== parts.length - 1) result.push({ text: bold, bold: true });
  });

  return result;
};

const getBoldText = (text: string, bold: number[][]) => {
  if (!bold.length) return [{ text, bold: false }];
  let cursor = 0;

  const result: { text: string; bold: boolean }[] = [];
  for (let i = 0; i < bold.length; i++) {
    const [start, end] = bold[i];

    if (start === end) continue;

    const prevText = text.slice(cursor, start);
    const boldText = text.slice(start, end);
    cursor = end;

    result.push(
      { text: prevText, bold: false },
      { text: boldText, bold: true }
    );

    if (!bold[i + 1]) result.push({ text: text.slice(end), bold: false });
  }

  return result;
};
