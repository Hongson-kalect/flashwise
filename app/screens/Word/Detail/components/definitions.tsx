import { AppPressable } from "@/components/AppPressable";
import AppAddIcon from "@/components/AppAddIcon";
import AppText from "@/components/AppText";
import { SkeletonReact } from "@/components/skeleton/ReactSkeleton";
import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { useMemo } from "react";
import { View, ViewStyle } from "react-native";
import { SenseContentType } from "../../data";
import { useWordLoading } from "../loadingContext";
import { EditFocus, useSenseEditor } from "../senseEdit";
import { getLangContent } from "../utils";
import WordExample from "./example";
import FormExample from "./formExample";

type Props = {
  definition?: SenseContentType;
  examples: SenseContentType[];
  isSimple?: boolean;
  word: string;
  style?: ViewStyle;
};

/** Nhấn giữ định nghĩa / bản dịch / ví dụ để sửa ngay phần đó; sửa toàn bộ nghĩa ở menu 3 chấm. */
const WordDefinitions = ({ definition, examples, isSimple, word, style }: Props) => {
  const settings = useAppStore((s) => s.settings);
  const isWordLoading = useWordLoading();
  const { theme } = useTheme();
  const { edit, canEdit } = useSenseEditor();

  const [tDefinition, nDefinition] = useMemo(
    () => [
      getLangContent(definition, settings?.learning_language),
      getLangContent(definition, settings?.translate_language),
    ],
    [definition, settings?.learning_language, settings?.translate_language],
  );
  const hold = (focus: EditFocus) => (canEdit ? () => edit(focus) : undefined);

  return (
    <View className="py-2" style={style}>
      <AppPressable onLongPress={hold("definition")}>
        <AppText color="subText1">
          {tDefinition?.value?.[0]?.toUpperCase()}
          {tDefinition?.value?.slice(1)}
        </AppText>
      </AppPressable>
      {settings?.show_translation && (
        <View>
          {nDefinition ? (
            <AppPressable
              onLongPress={hold("translation")}
              touchColor={theme.secondary + "20"}
              style={{ marginTop: 8, backgroundColor: theme.secondary + "0D", borderRadius: 12 }}
              className="px-3 py-2.5"
            >
              <AppText color="subText1" font="MulishLightItalic" size={"sm"}>
                {nDefinition.value}
              </AppText>
            </AppPressable>
          ) : isWordLoading ? (
            <View style={{ marginTop: 8 }}>
              <SkeletonReact width="85%" height={14} style={{ borderRadius: 6 }} />
              <SkeletonReact width="55%" height={14} style={{ borderRadius: 6, marginTop: 6 }} />
            </View>
          ) : (
            <AppPressable
              onPress={hold("translation")}
              touchColor={theme.secondary + "20"}
              style={{ marginTop: 8, backgroundColor: theme.secondary + "15", borderRadius: 12 }}
              className="px-3 py-2.5 flex-row items-center justify-between"
            >
              <AppText color="subText2" font="MulishRegularItalic" size={"sm"}>
                Chưa có bản dịch — chạm để thêm
              </AppText>
              <AppAddIcon size="sm" />
            </AppPressable>
          )}
        </View>
      )}

      {!isSimple ? (
        <View className="gap-2 mt-3">
          <FormExample />
          {examples?.map((example, index) => (
            <WordExample bold={word} example={example} index={index} key={"a" + index} />
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default WordDefinitions;
