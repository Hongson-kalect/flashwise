import { useTheme } from "@/providers/Theme";
import CollapseSection from "@/components/AppCollapsable";
import AppCard from "@/components/AppCard";
import AppText from "@/components/AppText";
import { useAppStore } from "@/stores/appStore";
import useModalStore from "@/stores/modalStore";
import { applyCommunitySense, applySummary } from "../communityApply";
import CommunitySuggestions from "./communitySuggestions";
import { AudioType as AppAudioType } from "@/stores/recordingStore";
import { DocumentPickerAsset } from "expo-document-picker";
import { ImageResult } from "expo-image-manipulator";
import { useEffect, useMemo, useState } from "react";
import { Keyboard, ToastAndroid, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { LineInput } from "../../Create/components/lineInput";
import CreateSenseBasicInfo from "./createSenseBasic";
import CreateSenseExample from "./createSenseExample";
import CreateSenseHeader from "./createSenseHeader";
import CreateSenseMoreInfo from "./createSenseMoreInfo";

export type SenseType = {
  word?: string;
  definition: string;
  traslatedDefinition: string;
  translations: string[];
  examples: SenseExample[];
  usage?: string;
  ipa?: string;
  audios?: {
    url: DocumentPickerAsset | AppAudioType | null;
    label: string;
  };
  image?: ImageResult | null;
  relateds?: string;
  synonyms?: string;
  antonyms?: string;
  id: string;
};

export type SenseExample = {
  id: string;
  value: string;
  translate?: string;
};
type AddSenseSheetProps = {
  senseValue: SenseType;
  setSenseValue: React.Dispatch<React.SetStateAction<SenseType>>;
  handleAddSense: () => void;
  word: string;
  wordId?: string;
};

const CreateSenseSheet = (props: AddSenseSheetProps) => {
  // Model sheet not sync with props, so we need to sync it manually
  const [senseValue, setSenseValue] = useState<SenseType>(props.senseValue);
  const { settings, dbService } = useAppStore();
  const { theme } = useTheme();

  const toggleLanguageMode = () =>
    dbService?.setShowTranslation(!settings?.show_translation);

  // Sync back to main screen. if close sheet, it still remain if reopen
  useEffect(() => props.setSenseValue(senseValue), [senseValue]);

  // Gợi ý nghĩa từ cộng đồng: chọn 1 nghĩa thì chỉ điền các ô đang trống, ô đã có dữ liệu giữ nguyên
  const { addModal, closeCurrentModal } = useModalStore();
  const wordLang: string = settings?.learning_language ?? "en";
  const userLang: string = settings?.translate_language ?? "vi";
  const openSuggestions = props.wordId
    ? () => {
        const wordId = props.wordId as string;
        Keyboard.dismiss();
        addModal({
          type: "custom",
          modalTitle: "Gợi ý từ cộng đồng",
          render: (
            <CommunitySuggestions
              wordId={wordId}
              wordLang={wordLang}
              userLang={userLang}
              onPick={(picked) => {
                const { next, filled, skipped } = applyCommunitySense(senseValue, picked, wordLang, userLang);
                setSenseValue(next);
                closeCurrentModal();
                ToastAndroid.show(applySummary({ filled, skipped }), ToastAndroid.LONG);
              }}
            />
          ),
        });
      }
    : undefined;

  return (
    <View className="px-4 pt-3 gap-4">
      <CreateSenseHeader setSenseValue={setSenseValue} />

      <AppCard>
        <CreateSenseBasicInfo
          senseValue={senseValue}
          setSenseValue={setSenseValue}
          onSuggest={openSuggestions}
        />
      </AppCard>

      <Animated.View layout={LinearTransition} className="gap-4">
        <CreateSenseExample
          word={props.word}
          senseValue={senseValue}
          setSenseValue={setSenseValue}
        />
        <CreateSenseMoreInfo
          senseValue={senseValue}
          setSenseValue={setSenseValue}
        />
        <CollapseSection title="Từ liên quan">
          <View className="items-end mt-3">
            <AppText size="xs" color="subText2">
              Ngăn cách các từ bằng dấu phẩy
            </AppText>
          </View>
          <View className="py-3">
            <LineInput
              label="Từ liên quan"
              value={senseValue.relateds || ""}
              setValue={(text) => setSenseValue({ ...senseValue, relateds: text })}
              size="xs"
              placeholder="Từ hoặc cụm từ có liên quan"
            />
          </View>
          <View className="pb-3">
            <LineInput
              label="Từ đồng nghĩa"
              value={senseValue.synonyms || ""}
              setValue={(text) => setSenseValue({ ...senseValue, synonyms: text })}
              size="xs"
              placeholder="Từ có nghĩa tương tự"
            />
          </View>
          <View className="pb-4">
            <LineInput
              label="Từ trái nghĩa"
              value={senseValue.antonyms || ""}
              setValue={(text) => setSenseValue({ ...senseValue, antonyms: text })}
              size="xs"
              placeholder="Từ có nghĩa đối lập"
            />
          </View>
        </CollapseSection>
      </Animated.View>
      <View style={{ height: 60 }} />
    </View>
  );
};

export default CreateSenseSheet;
