import AppAddIcon from "@/components/AppAddIcon";
import { AppPressable } from "@/components/AppPressable";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { FontAwesome } from "@expo/vector-icons";
import { useMemo } from "react";
import { View } from "react-native";
import { Divider } from "react-native-paper";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SenseContentType } from "../../data";
import { useSenseEditor } from "../senseEdit";
import { getLangContent } from "../utils";

type Props = {
  word: string;
  usage?: SenseContentType;
};

/** Nhấn giữ để sửa; khi chưa có thì chạm vào dòng gợi ý để thêm. */
const SenseUsage = (props: Props) => {
  const settings = useAppStore((s) => s.settings);
  const { theme } = useTheme();
  const { edit, canEdit } = useSenseEditor();

  const [tUsage, nUsage] = useMemo(
    () => [
      getLangContent(props.usage, settings?.learning_language),
      getLangContent(props.usage, settings?.translate_language),
    ],
    [props.usage, settings?.learning_language, settings?.translate_language],
  );
  const open = canEdit ? () => edit("usage") : undefined;

  return (
    <Animated.View className={"mt-2"} layout={LinearTransition}>
      <View className="flex-row items-center gap-2 h-8">
        <FontAwesome style={{ width: 14 }} name="search" size={14} color={theme.title} />
        <AppTitle title="Usage" />
      </View>
      <Divider />
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
          style={{
            marginHorizontal: -8,
            marginTop: 4,
            marginBottom: 8,
            backgroundColor: theme.secondary + "08",
            paddingHorizontal: 8,
          }}
          className="p-3"
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
