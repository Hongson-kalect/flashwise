import EditIcon from "@/components/icons/editIcon";
import WordInput from "@/components/input/wordInput";
import PhatAm from "@/components/PhatAm";
import PhienAm from "@/components/PhienAm";
import { useTheme } from "@/providers/Theme";
import { AudioType } from "@/stores/recordingStore";
import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";
import LabelInformation from "../../../../../../components/output/labelInformation";
import AudioPicker from "../../../components/AudioPicker";
import AudioRecoder from "../../../components/AudioRecorder";
import TranslateDetailHeader from "./components/header";

export default function TranslateCreate() {
  const { theme } = useTheme();
  const { height } = useWindowDimensions();
  const [labelWidth, setLabelWidth] = useState(0);
  const [pageMode, setPageMode] = useState<"view" | "update" | "create">(
    "view"
  );
  const [audio, setAudio] = useState<DocumentPickerAsset | AudioType | null>(
    null
  );
  const sound = useState<Audio.Sound | null>(null);
  const { id } = useLocalSearchParams() as { id: string };

  const onLabelLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;

    setLabelWidth((prev) => (width > prev ? width : prev));
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <TranslateDetailHeader
        title={"Run"}
        id={id}
        mode={pageMode}
        setMode={setPageMode}
      />
      <ScrollView keyboardShouldPersistTaps="handled" className="px-2">
        {/* <AppText>Chọn quốc gia</AppText> */}
        <View
          className="mt-8"
          style={{
            minHeight: height - (StatusBar?.currentHeight || 32) - 220,
          }}
        >
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
                  <AudioPicker
                    onAudioChange={(result) => {
                      setAudio(result);
                    }}
                  />
                </Animated.View>
              )}
              <PhatAm audio={audio} sound={sound} disabled={!audio?.uri} />

              {pageMode !== "view" && (
                <Animated.View entering={SlideInRight} exiting={SlideOutRight}>
                  <AudioRecoder
                    onAudioChange={(result) => {
                      setAudio(result);
                    }}
                  />
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
