import CollapseSection from "@/components/AppCollapsable";
import AppText from "@/components/AppText";
import { AudioType as AppAudioType } from "@/stores/recordingStore";
import { DocumentPickerAsset } from "expo-document-picker";
import { ImageResult } from "expo-image-manipulator";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
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
  translate: string;
};
type AddSenseSheetProps = {
  senseValue: SenseType;
  setSenseValue: React.Dispatch<React.SetStateAction<SenseType>>;
  handleAddSense: () => void;
  setLanguageMode: React.Dispatch<React.SetStateAction<1 | 2>>;
  languageMode: 1 | 2;
  word: string;
};

const CreateSenseSheet = (props: AddSenseSheetProps) => {
  // Model sheet not sync with props, so we need to sync it manually
  const [senseValue, setSenseValue] = useState<SenseType>(props.senseValue);
  const [languageMode, setLanguageMode] = useState<1 | 2>(props.languageMode);

  // Sync back to main screen. if close sheet, it still remain if reopen
  useEffect(() => props.setSenseValue(senseValue), [senseValue]);

  return (
    <View className="p-4">
      <CreateSenseHeader
        languageMode={languageMode}
        setLanguageMode={setLanguageMode}
        setSenseValue={setSenseValue}
      />

      <CreateSenseBasicInfo
        languageMode={languageMode}
        senseValue={senseValue}
        setSenseValue={setSenseValue}
      />
      {/* Advanced info */}
      <Animated.View layout={LinearTransition} className="mt-8">
        <View className="bg-gray-100 -mx-3 pl-2">
          <CreateSenseExample
            word={props.word}
            languageMode={languageMode}
            senseValue={senseValue}
            setSenseValue={setSenseValue}
          />
        </View>

        <View className="mt-8 bg-gray-100 -mx-3 px-2">
          <CreateSenseMoreInfo
            senseValue={senseValue}
            setSenseValue={setSenseValue}
          />
        </View>

        <View className="mt-8 bg-gray-100 -mx-3 px-2">
          <CollapseSection title="Related word">
            <View className="items-end mt-2">
              <AppText size={"xs"} color="primary" font="MulishLightItalic">
                {'Each word separated by ","'}
              </AppText>
            </View>
            <View className="px-1 py-4">
              <LineInput
                onPreset={() => Alert.alert("show ipa preset")}
                label="Related word"
                value={senseValue.relateds || ""}
                setValue={(text) =>
                  setSenseValue({ ...senseValue, relateds: text })
                }
                size="xs"
                placeholder="Closely related words or expressions"
              />
            </View>
            <View className="px-1 py-4">
              <LineInput
                onPreset={() => Alert.alert("show ipa preset")}
                label="Synonyms"
                value={senseValue.synonyms || ""}
                setValue={(text) =>
                  setSenseValue({ ...senseValue, synonyms: text })
                }
                size="xs"
                placeholder="Words with similar meaning"
              />
            </View>
            <View className="px-1 py-4">
              <LineInput
                onPreset={() => Alert.alert("show ipa preset")}
                label="Antonyms"
                value={senseValue.antonyms || ""}
                setValue={(text) =>
                  setSenseValue({ ...senseValue, antonyms: text })
                }
                size="xs"
                placeholder="Words with opposite meaning"
              />
            </View>
            <View className="h-4">{/* bottom padding */}</View>
          </CollapseSection>
        </View>
      </Animated.View>
      <View style={{ height: 100 }}></View>
    </View>
  );
};

export default CreateSenseSheet;
