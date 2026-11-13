import AppAddIcon from "@/components/AppAddIcon";
import { useWordLangs } from "../wordLang";
import { AppPressable } from "@/components/AppPressable";
import AppText from "@/components/AppText";

import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { FontAwesome } from "@expo/vector-icons";
import { useMemo } from "react";

import Animated, { LinearTransition } from "react-native-reanimated";
import { SenseContentType } from "../../data";
import { useSenseEditor } from "../senseEdit";
import { getLangContent } from "../utils";
import SectionHeader from "./sectionHeader";

type Props = {
  word: string;
  usage?: SenseContentType;
};

/** Nhấn giữ để sửa; khi chưa có thì chạm vào dòng gợi ý để thêm. */
const SenseUsage = (props: Props) => {
  const settings = useAppStore((s) => s.settings);
  const { lang: wordLang, userLang } = useWordLangs();
  const { theme } = useTheme();
  const { edit, canEdit } = useSenseEditor();

  const [tUsage, nUsage] = useMemo(
    () => [
      getLangContent(props.usage, wordLang),
      getLangContent(props.usage, userLang),
    ],
    [props.usage, wordLang, userLang],
  );
  const open = canEdit ? () => edit("usage") : undefined;

  return (
    <Animated.View className={"mt-6"} layout={LinearTransition}>
      <SectionHeader
        icon={<FontAwesome name="search" size={14} color={theme.title} />}
        title="Usage"
      />
      {tUsage?.value ? (
        <AppPressable onLongPress={open} hitSlop={8} className="py-2">
          <AppText color="subText1">{tUsage.value}</AppText>
        </AppPressable>
      ) : (
        <AppPressable onPress={open} className="py-3 flex-row items-center justify-between">
          <AppText color="subText2" font="MulishRegularItalic" size={"sm"}>
            Chưa có cách dùng — chạm để thêm
          </AppText>
          <AppAddIcon size="sm" />
        </AppPressable>
      )}

      {settings?.show_translation && nUsage?.value ? (
        <AppPressable
          onLongPress={open}
          touchColor={theme.secondary + "20"}
          style={{ marginTop: 8, backgroundColor: theme.secondary + "0D", borderRadius: 12 }}
          className="px-3 py-2.5"
        >
          <AppText color="subText1" font="MulishLightItalic" size={"sm"}>
            {nUsage.value}
          </AppText>
        </AppPressable>
      ) : null}
    </Animated.View>
  );
};

export default SenseUsage;
