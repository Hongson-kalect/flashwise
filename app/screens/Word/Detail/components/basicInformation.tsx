import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import PhatAm from "@/components/PhatAm";
import PhienAm from "@/components/PhienAm";
import { useTheme } from "@/providers/Theme";
import { AudioType } from "@/stores/recordingStore";
import { Entypo } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
import { ImageResult } from "expo-image-manipulator";
import { useState } from "react";
import { Image, LayoutChangeEvent, View } from "react-native";
import WordTitle from "../../Create/components/wordTitle";

interface Props {
  labelWidth: number;
  onLabelLayout: (event: LayoutChangeEvent) => void;
}

const BasicInformation = ({ labelWidth, onLabelLayout }: Props) => {
  const [image, setImage] = useState<ImageResult | null>(null);
  const [audio, setAudio] = useState<DocumentPickerAsset | AudioType | null>(
    null
  );
  const sound = useState<Audio.Sound | null>(null);
  const { theme } = useTheme();

  return (
    <View>
      <View className="items-center mb-6">
        <WordTitle>Run</WordTitle>
        <View className="flex-row gap-2 items-center">
          <View className="flex-1 flex-row items-center justify-end">
            <Entypo name="sound" size={16} color={theme.subText3} />
            <PhienAm> /caːj˧˦/</PhienAm>
          </View>
          <View
            style={{ height: 20, borderRightWidth: 0.5, borderColor: "gray" }}
          ></View>
          <View className="flex-1">
            <AppText size={"sm"} color="subText2">
              Động từ (v)
            </AppText>
          </View>
        </View>
        <PhatAm audio={audio} sound={sound} disabled={!audio?.uri} />
      </View>
      <AppTitle title="Định nghĩa 📖" />
      <View>
        <AppText>Cái này là mô phỏng của chức năng định nghĩa</AppText>
      </View>

      <View className="mt-6 items-center justify-center">
        {image?.uri ? (
          <View
            style={{ elevation: 4, overflow: "hidden" }}
            className="h-40 w-40  rounded-lg"
          >
            <Image
              source={{ uri: image?.uri }}
              style={{ width: "100%", height: "100%" }}
            />
          </View>
        ) : (
          // <TouchableOpacity className="h-40 w-40 bg-gray-200 rounded-lg p-4">
          <AppIcon
            name={"image"}
            branch="feather"
            size={140}
            color="subText3"
          />
          //  </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default BasicInformation;
