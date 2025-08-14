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
import WordInput from "../../../../../../components/input/wordInput";
import Information from "../../../../../../components/output/information";
import CreateTranslateHeader from "./components/header";
import PhienAm from "@/components/PhienAm";
import EditIcon from "@/components/icons/editIcon";
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";
import AudioPicker from "../../../components/AudioPicker";
import PhatAm from "@/components/PhatAm";
import AudioRecoder from "../../../components/AudioRecorder";
import LabelInformation from "@/components/output/labelInformation";

export default function TranslateCreate() {
  const { theme } = useTheme();
  const [labelWidth, setLabelWidth] = useState(0);
  const [pageMode, setPageMode] = useState<"view" | "update" | "create">(
    "create"
  );
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
      <ScrollView keyboardShouldPersistTaps="handled" className="px-2">
        {/* <AppText>Chọn quốc gia</AppText> */}
        <View className="mt-8">
          <View className="items-center justify-center">
            {/* <WordTitle>Chạy</WordTitle> */}
            <WordInput value="Chạy" />
            <TouchableOpacity className="my-2">
              <PhienAm>/caːj˧˦/</PhienAm>
              {pageMode !== "view" && (
                <View className="absolute -right-8 top-1/2 -translate-y-1/2">
                  <EditIcon />
                </View>
              )}
            </TouchableOpacity>

            {/* <PhatAm audio={audio} disabled={!audio?.uri} sound={sound} /> */}
            <View className="flex-row items-center justify-center gap-2 mt-2">
              {/* <AppText></AppText> */}
              {pageMode !== "view" && (
                <Animated.View entering={SlideInLeft} exiting={SlideOutLeft}>
                  <AudioPicker onAudioChange={setAudio} />
                </Animated.View>
              )}
              <PhatAm audio={audio} sound={sound} disabled={!audio?.uri} />

              {pageMode !== "view" && (
                <Animated.View entering={SlideInRight} exiting={SlideOutRight}>
                  <AudioRecoder onAudioChange={setAudio} />
                </Animated.View>
              )}
            </View>
          </View>

          <View className="mt-8">
            <View className="mt-2 gap-6">
              <LabelInformation mode={pageMode} label="💡 Ví dụ" />
              <LabelInformation mode={pageMode} label="🌎 Bản dịch khác" />
              <LabelInformation
                mode={pageMode}
                label="📝 Ghi chú"
                value={"Ngày buồn rười rượi là ngày mà em xa tâu"}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
