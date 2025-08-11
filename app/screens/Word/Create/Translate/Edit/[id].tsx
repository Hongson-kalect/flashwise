import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { AudioType } from "@/stores/recordingStore";
import { playAudio } from "@/utils/audioPlay";
import { startRecording } from "@/utils/audioRecord";
import { pickAudio } from "@/utils/pickaudio";
import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
import { useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Information from "../../components/information";
import WordInput from "../../components/wordInput";
import CreateTranslateHeader from "./components/header";

export default function TranslateEdit() {
  const { theme } = useTheme();
  const [labelWidth, setLabelWidth] = useState(0);
  const [audio, setAudio] = useState<DocumentPickerAsset | AudioType | null>(
    null
  );
  const sound = useState<Audio.Sound | null>(null);

  const onLabelLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;

    setLabelWidth((prev) => (width > prev ? width : prev));
  };

  const handlePickAudio = async () => {
    const result = await pickAudio();
    if (result) {
      setAudio(result);
    }
  };

  const handleStartRecording = () => {
    startRecording(handleStopRecording);
  };

  const handleStopRecording = (result: AudioType | null) => {
    if (!result) return;
    if (result?.duration && result?.duration > 5000)
      return alert("Recording must be less than 5 seconds");
    else setAudio(result);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <CreateTranslateHeader />
      {/* <AppText>Tạo bản dịch [nhiều]</AppText> */}
      <ScrollView keyboardShouldPersistTaps="handled" className="px-2 mt-8">
        {/* <AppText>Chọn quốc gia</AppText> */}
        <WordInput />

        <View className="mt-8">
          <Information
            labelWidth={labelWidth}
            onLabelLayout={onLabelLayout}
            label="Phiên âm"
            editable
          />
          <Information
            onLabelLayout={onLabelLayout}
            labelWidth={labelWidth}
            editable
            label="Phát âm"
            value={
              <View className="flex-row gap-2">
                <View className="gap-2 w-1/2">
                  <TouchableOpacity
                    onPress={handlePickAudio}
                    style={{ backgroundColor: theme.secondary }}
                    className="flex-1 border-gray-400 rounded-lg h-10 px-3 py-2 items-center justify-center"
                  >
                    <AppText color="white" size={"sm"}>
                      Chọn file
                    </AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ borderWidth: 0.5, borderColor: theme.secondary }}
                    className="rounded-lg items-center justify-center flex-1 h-10"
                  >
                    <AppIcon
                      onPress={handleStartRecording}
                      name={"mic"}
                      branch="feather"
                      size={20}
                      color={theme.secondary}
                    />
                  </TouchableOpacity>
                </View>

                <View className="flex-row gap-2 items-end flex-1">
                  <TouchableOpacity
                    onPress={() => playAudio(audio?.uri || "", sound)}
                    disabled={!audio?.uri}
                    style={{
                      backgroundColor: audio?.uri
                        ? theme.primary
                        : theme.subText3,
                    }}
                    className=" border-gray-400 rounded-lg h-24 w-full items-center justify-center"
                  >
                    <AppIcon
                      name={"volume-2"}
                      branch="feather"
                      color="white"
                      size={32}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            }
          />

          <View className="mt-2">
            <Information
              labelWidth={labelWidth}
              onLabelLayout={onLabelLayout}
              label="Ghi chú"
              editable
            />
            <Information
              labelWidth={labelWidth}
              onLabelLayout={onLabelLayout}
              label="Ví dụ"
              editable
            />
            <Information
              labelWidth={labelWidth}
              onLabelLayout={onLabelLayout}
              label="Bản dịch khác"
              editable
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
