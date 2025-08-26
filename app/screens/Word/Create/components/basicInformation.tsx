import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import EditIcon from "@/components/icons/editIcon";
import WordInput from "@/components/input/wordInput";
import PhatAm from "@/components/PhatAm";
import PhienAm from "@/components/PhienAm";
import {
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "@/interfaces/word";
import { useTheme } from "@/providers/Theme";
import { AudioType } from "@/stores/recordingStore";
import { pickImage } from "@/utils/pickImage";
import { Entypo } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
import { ImageResult } from "expo-image-manipulator";
import { useState } from "react";
import { Image, LayoutChangeEvent, TouchableOpacity, View } from "react-native";
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";
import Information from "../../../../../components/output/information";
import AudioPicker from "../../components/AudioPicker";
import AudioRecoder from "../../components/AudioRecorder";

interface Props {
  mode?: "create" | "update" | "view";
  labelWidth: number;
  onLabelLayout: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
}

const BasicInformation = ({
  mode,
  labelWidth,
  onLabelLayout,
  openInputModal,
  openRadioModal,
}: Props) => {
  const [image, setImage] = useState<ImageResult | null>(null);
  const [audio, setAudio] = useState<DocumentPickerAsset | AudioType | null>(
    null
  );
  const sound = useState<Audio.Sound | null>(null);
  const { theme } = useTheme();

  const handlePickImage = async () => {
    const result = (await pickImage()) as ImageResult;
    if (result) {
      setImage(result);
    }
  };

  return (
    <View>
      <View className="items-center mb-6">
        <TouchableOpacity
          onPress={() => alert("Đổi Ngôn ngữ em ây")}
          className=" w-full mr-4 flex-row gap-2 items-center justify-end"
        >
          <View className="-scale-x-100">
            <EditIcon />
          </View>
          <View className="rounded bg-red-400 h-10 w-16"></View>
        </TouchableOpacity>

        {/* <WordTitle>Run</WordTitle> */}
        <View className="py-2 w-full">
          <WordInput editable={true} />
        </View>
        <View className="flex-row gap-2 items-center mt-2">
          <TouchableOpacity
            onPress={() =>
              openInputModal({ title: "Phiên âm", field: "phienAm" })
            }
            disabled={mode === "view"}
            className="flex-1 flex-row items-center justify-end"
          >
            {mode !== "view" && (
              // Do scale ngược nên hiệu ứng animation cũng bị ngược
              // Thực tế nó sẽ ra vào bên trái
              <View className="-scale-x-100 mr-2">
                <EditIcon in="slideInRight" out="slideOutRight" />
              </View>
            )}
            <Entypo name="sound" size={16} color={theme.subText3} />
            <PhienAm> Phiên âm...</PhienAm>
            {/* <PhienAm> /caːj˧˦/</PhienAm> */}
          </TouchableOpacity>
          <View
            style={{ height: 20, borderRightWidth: 0.5, borderColor: "gray" }}
          ></View>
          <TouchableOpacity
            disabled={mode === "view"}
            onPress={() =>
              openRadioModal({ title: "Loại", field: "loai", options: [] })
            }
            className="flex-1 gap-2 flex-row items-center"
          >
            {/* <AppText size={"sm"} color="subText2">
              Động từ (v)
            </AppText> */}
            <AppText size={"sm"} color="subText3">
              Từ loại...
            </AppText>

            {mode !== "view" && (
              <EditIcon in="slideInRight" out="slideOutRight" />
            )}
          </TouchableOpacity>
        </View>
        <View>
          <View className="flex-row items-center justify-center gap-2 mt-2">
            {/* <AppText></AppText> */}
            {mode !== "view" && (
              <Animated.View entering={SlideInLeft} exiting={SlideOutLeft}>
                <AudioPicker onAudioChange={setAudio} />
              </Animated.View>
            )}
            <PhatAm audio={audio} sound={sound} disabled={!audio?.uri} />

            {mode !== "view" && (
              <Animated.View entering={SlideInRight} exiting={SlideOutRight}>
                <AudioRecoder onAudioChange={setAudio} />
              </Animated.View>
            )}
          </View>
          <View className="flex-row items-center justify-center">
            <AppText size={"sm"} color="subText3" style={{ marginTop: 4 }}>
              Phát âm của từ...
            </AppText>
          </View>
        </View>
      </View>
      <AppTitle title="Định nghĩa 📖" />
      <View>
        <Information
          mode={mode}
          placeholder="Nhập định nghĩa của từ..."
          // value={"Cái này là mô phỏng của chức năng định nghĩa"}
        />
      </View>

      <View className="mt-6 items-center justify-center">
        {image?.uri ? (
          <TouchableOpacity
            onPress={handlePickImage}
            style={{
              elevation: 4,
              overflow: "hidden",
              backgroundColor: theme.background,
            }}
            className="h-40 w-40  rounded-lg"
          >
            <Image
              source={{ uri: image?.uri }}
              style={{ width: "100%", height: "100%" }}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handlePickImage}
            style={{
              borderColor: theme.secondary,
              backgroundColor: theme.secondary + "10",
            }}
            className="h-40 w-40 border border-dashed  rounded-lg p-4"
          >
            <AppText color="subText2" size={"xs"}>
              Hình minh họa
            </AppText>
          </TouchableOpacity>
          //  </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default BasicInformation;
