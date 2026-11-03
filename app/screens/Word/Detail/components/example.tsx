import { AppPressable } from "@/components/AppPressable";
import AppText from "@/components/AppText";
import { BoldText } from "@/components/output/BoldText";
import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { useMemo } from "react";
import { View } from "react-native";
import { SenseContentType } from "../../data";
import { useSenseEditor } from "../senseEdit";
import { getLangContent } from "../utils";

type Props = {
  bold: number[][] | string;
  example: SenseContentType;
  /** Vị trí trong danh sách ví dụ của nghĩa, để nhấn giữ sửa đúng ví dụ này. */
  index: number;
};

const cap = (s?: string) => `${s?.[0]?.toUpperCase() || ""}${s?.slice(1) || ""}`;

const WordExample = ({ example, bold, index }: Props) => {
  const settings = useAppStore((s) => s.settings);
  const { theme } = useTheme();
  const { edit, canEdit } = useSenseEditor();
  const [tExample, nExample] = useMemo(
    () => [
      getLangContent(example, settings?.learning_language),
      getLangContent(example, settings?.translate_language),
    ],
    [example, settings?.learning_language, settings?.translate_language],
  );
  const onHold = canEdit ? () => edit(`example:${index}`) : undefined;

  return (
    <View
      style={{
        borderLeftWidth: 2,
        borderLeftColor: theme.text + "33",
        backgroundColor: theme.text + "08",
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
      }}
    >
      <AppPressable hitSlop={5} className="py-2 pl-2" onLongPress={onHold}>
        <AppText size={"xs"} font="MulishBold" color="title">
          <BoldText
            size={"sm"}
            color="subText1"
            boldColor="text"
            font="MulishRegular"
            boldFont="MulishBoldItalic"
            text={cap(tExample?.value)}
            bold={bold}
          />
        </AppText>
      </AppPressable>
      {settings?.show_translation && nExample ? (
        <AppPressable onLongPress={onHold} hitSlop={{ bottom: 5 }}>
          <AppText font="MulishLightItalic" size={"xs"} color="subText2" className="pt-1 pb-2 pl-2">
            {cap(nExample?.value)}
          </AppText>
        </AppPressable>
      ) : null}
    </View>
  );
};
export default WordExample;
