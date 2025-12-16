import AppButton from "@/components/AppButton";
import CollapseSection from "@/components/AppCollapsable";
import AppIcon from "@/components/AppIcon";
import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import PhatAm from "@/components/PhatAm";
import { useTheme } from "@/providers/Theme";
import { AudioType as AppAudioType } from "@/stores/recordingStore";
import { pickImage } from "@/utils/pickImage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
import { ImageResult } from "expo-image-manipulator";
import { Dispatch, SetStateAction, useState } from "react";
import {
  Image,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import AudioPicker from "../../components/AudioPicker";
import AudioRecoder from "../../components/AudioRecorder";
import { LineInput } from "../../Create/components/lineInput";
import { SenseType } from "./createSenseSheet";

type AudioType = {
  label: string;
  audio: DocumentPickerAsset | AppAudioType | null;
};

type Props = {
  senseValue: SenseType;
  setSenseValue: Dispatch<SetStateAction<SenseType>>;
};
const CreateSenseMoreInfo = ({ senseValue, setSenseValue }: Props) => {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const [audio, setAudio] = useState<AudioType>({
    label: "",
    audio: null,
  });

  const sound = useState<Audio.Sound | null>(null);

  const handlePickImage = async () => {
    const result = (await pickImage([9, 16])) as ImageResult;
    if (result) {
      setSenseValue((prev) => ({
        ...prev,
        image: result,
      }));
    }
  };

  return (
    <CollapseSection title="Advanced information">
      <View className="px-1 py-4">
        <LineInput
          onPreset={() => {}}
          label="Usage"
          value={senseValue.usage || ""}
          setValue={(text) => setSenseValue({ ...senseValue, usage: text })}
          size="xs"
          placeholder="When, where, or how this sense is typically used"
        />
      </View>

      <View className="px-1 py-4">
        <LineInput
          onPreset={() => {}}
          label="IPA"
          value={senseValue.ipa || ""}
          setValue={(text) => setSenseValue({ ...senseValue, ipa: text })}
          size="xs"
          placeholder="Pronunciation in IPA"
        />
      </View>

      <View className="px-1 py-4">
        <View className="flex-row items-center justify-between">
          <AppText color="subText2" font="MulishRegularItalic" size={"xs"}>
            {"Audio"}
          </AppText>

          <TouchableOpacity
            onPress={() => {}}
            hitSlop={10}
            className="gap-1 items-center flex-row"
          >
            <AppText color="secondary" font="MulishBold" size={"xs"}>
              Preset
            </AppText>
            <AppIcon branch="antd" name={"right"} size={12} color="secondary" />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2 mt-1">
          <View className="flex-1">
            <AppInput
              containerStyle={{ backgroundColor: theme.background }}
              value={audio.label}
              onChangeText={(val) =>
                setAudio((prev) => ({ ...prev, label: val }))
              }
              size={"sm"}
              placeholder="Label (US / UK / etc.)"
            />
          </View>
          <View className="options flex-row items-center gap-2">
            <PhatAm
              size="small"
              audio={audio.audio}
              sound={sound}
              disabled={!audio.audio?.uri}
            />
            <AudioPicker
              size="small"
              onAudioChange={(val) =>
                setAudio((prev) => ({ ...prev, audio: val }))
              }
            />
            <View className="">
              <AudioRecoder
                size="small"
                onAudioChange={(val) =>
                  setAudio((prev) => ({ ...prev, audio: val }))
                }
              />
            </View>
          </View>
        </View>
      </View>

      <View className="px-1 py-4">
        <View className="flex-row items-center justify-between">
          <AppText color="subText2" font="MulishRegularItalic" size={"xs"}>
            Image
          </AppText>

          <TouchableOpacity
            onPress={() => {}}
            hitSlop={10}
            className="gap-1 items-center flex-row"
          >
            <AppText color="secondary" font="MulishBold" size={"xs"}>
              Preset
            </AppText>
            <AppIcon branch="antd" name={"right"} size={12} color="secondary" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-start mt-4">
          {senseValue.image?.uri ? (
            <TouchableOpacity
              onPress={handlePickImage}
              style={{
                // elevation: 4,
                overflow: "hidden",
                backgroundColor: theme.background,
                height: ((width - 32) / 16) * 9,
                width: width - 32,
              }}
              className="rounded-lg"
            >
              <Image
                source={{ uri: senseValue.image?.uri }}
                style={{ width: "100%", height: "100%" }}
              />
            </TouchableOpacity>
          ) : (
            <AppButton onPress={handlePickImage}>
              <MaterialCommunityIcons
                name="cursor-pointer"
                size={16}
                color="white"
              />
              <AppText color="white" size={"sm"}>
                Pick image
              </AppText>
            </AppButton>
            //  </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="h-4">{/* bottom padding */}</View>
    </CollapseSection>
  );
};

export default CreateSenseMoreInfo;
