import { simpleKatexToText } from "@/utils/katextConvert";
import AppText from "./AppText";

const SimpleKatex = ({ text, props }: { text: string; props: any }) => {
  const renderText = simpleKatexToText(text);
  return <AppText {...props}>{renderText}</AppText>;
};

export default SimpleKatex;
