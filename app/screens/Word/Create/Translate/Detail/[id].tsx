import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { AudioType } from "@/stores/recordingStore";
import { playAudio } from "@/utils/audioPlay";
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
import LabelInformation from "../../components/labelInformation";
import TranslateDetailHeader from "./components/header";

export default function TranslateCreate() {
  const { theme } = useTheme();
  const { height } = useWindowDimensions();
  const [labelWidth, setLabelWidth] = useState(0);
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
      <TranslateDetailHeader title={"Run"} id={id} />
      <ScrollView keyboardShouldPersistTaps="handled" className="px-2">
        {/* <AppText>Chọn quốc gia</AppText> */}
        <View
          className="mt-8"
          style={{
            minHeight: height - (StatusBar?.currentHeight || 32) - 220,
          }}
        >
          <View className="items-center justify-center">
            <AppText color="primary" weight="bold" size={36}>
              Chạy
            </AppText>
            <AppText size={"sm"} color={"subText3"}>
              /caːj˧˦/
            </AppText>
            <TouchableOpacity
              onPress={() => playAudio(audio?.uri || "", sound)}
              disabled={!audio?.uri}
              style={{
                backgroundColor: audio?.uri ? theme.primary : theme.subText3,
              }}
              className=" border-gray-400 rounded-lg h-16 w-16 items-center justify-center mt-2"
            >
              <AppIcon
                name={"volume-2"}
                branch="feather"
                color="white"
                size={32}
              />
            </TouchableOpacity>
          </View>

          <View className="mt-8">
            <View className="mt-2 gap-6">
              <LabelInformation
                label="📝 Ghi chú"
                value={"Ngày buồn rười rượi là ngày mà em xa tâu"}
              />
              <LabelInformation label="💡 Ví dụ" />
              <LabelInformation label="🌎 Bản dịch khác" />
            </View>
          </View>
        </View>

        <View className="my-12">
          <AppButton size="lg" type="error" title="Delete" onPress={() => {}}>
            <AppIcon name="trash" branch="feather" size={20} color="white" />
            <AppText color="white" size={"lg"}>
              Delete
            </AppText>
          </AppButton>
        </View>
      </ScrollView>
    </View>
  );
}
