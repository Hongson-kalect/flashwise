import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import { useTheme } from "@/providers/Theme";
import useRecordingStore, { AudioType } from "@/stores/recordingStore";
import { startRecording } from "@/utils/audioRecord";
import { pickAudio } from "@/utils/pickaudio";
import { pickImage } from "@/utils/pickImage";
import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
import { ImageResult } from "expo-image-manipulator";
import { useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "../screen";
import Information from "./information";

type Props = {
  labelWidth: number;
  onLabelLayout: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
};

const WordCreateBasicForm = ({
  labelWidth,
  onLabelLayout,
  openInputModal,
  openRadioModal,
}: Props) => {
  const { theme } = useTheme();
  const [image, setImage] = useState<ImageResult | null>(null);
  const { onRecording, setOnRecording } = useRecordingStore();
  const [audio, setAudio] = useState<DocumentPickerAsset | AudioType | null>(
    null
  );
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { width, height } = useWindowDimensions();

  const handlePickImage = async () => {
    const result = await pickImage();
    if (result) {
      const { image, uri } = result;
      setImage(image);
    }
  };

  const handlePickAudio = async () => {
    // setIsRecording(true);
    const result = await pickAudio();
    if (result) {
      setAudio(result);
    }
  };

  const handleRecording = () => {
    startRecording();
    setOnRecording((result) => {
      console.log("aaaaaaaaaa", result);
      if (result?.duration && result?.duration > 5000)
        return alert("Recording must be less than 5 seconds");
      else setAudio(result);
    });
  };

  const playAudio = async () => {
    try {
      if (!audio) return;
      if (sound) {
        await sound.unloadAsync(); // Xóa âm thanh cũ nếu có
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audio.uri || "" },
        { shouldPlay: true }
      );

      setSound(newSound);
      console.log("🔊 Đang phát audio...");
    } catch (err) {
      console.error("❌ Lỗi khi phát audio:", err);
    }
  };
  return (
    <View>
      <AppTitle title="Định nghĩa " />
      <TouchableOpacity
        onPress={() =>
          openInputModal({ type: "prompt", title: "Định nghĩa", field: "" })
        }
        className="flex-row gap-1 mt-1"
      >
        <View className="flex-1">
          <AppText>Cái này là mô phỏng của chức năng định nghĩa</AppText>
        </View>
        <View>
          <View className="px-3 py-1.5 items-center justify-center rounded">
            <AppIcon
              name="edit"
              branch="antd"
              size={16}
              color={theme.secondary}
            />
          </View>
        </View>
      </TouchableOpacity>

      <View className="mt-6 items-center justify-center">
        {image?.uri ? (
          <TouchableOpacity
            onPress={handlePickImage}
            style={{ elevation: 4, overflow: "hidden" }}
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
            className="h-40 w-40 border border-dashed border-gray-400 rounded-lg p-4"
          >
            <AppText color="subText2" size={"xs"}>
              Chọn hình minh hoạ
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      <View className="mt-8 gap-1">
        <Information
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          editable
          label="Loại từ"
          value=""
          onPress={() =>
            openRadioModal({
              title: "Loại từ",
              field: "",
              options: [
                { label: "Động từ", value: "1" },
                { label: "Danh từ", value: "2" },
              ],
            })
          }
        />
        <Information
          onLabelLayout={onLabelLayout}
          labelWidth={labelWidth}
          editable
          label="Phiên âm"
          value="Phiên âm"
          onPress={() => openInputModal({ title: "Phiên âm", field: "" })}
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
                    onPress={handleRecording}
                    name={"mic"}
                    branch="feather"
                    size={20}
                    color={theme.secondary}
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-2 items-end flex-1">
                <TouchableOpacity
                  onPress={() => playAudio()}
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
      </View>
    </View>
  );
};

export default WordCreateBasicForm;
