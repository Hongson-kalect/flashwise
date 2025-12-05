import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import EditIcon from "@/components/icons/editIcon";
import PhatAm from "@/components/PhatAm";
import PhienAm from "@/components/PhienAm";
import {
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "@/interfaces/word";
import { useTheme } from "@/providers/Theme";
import { FontAwesome } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
import { ImageResult } from "expo-image-manipulator";
import { useMemo, useState } from "react";
import { Image, LayoutChangeEvent, TouchableOpacity, View } from "react-native";
import { Divider } from "react-native-paper";
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";
import AudioPicker from "../../components/AudioPicker";
import AudioRecoder from "../../components/AudioRecorder";
import { WordInfoType, WordType } from "../../data";

interface Props {
  definations: WordType["definations"];
  data: WordInfoType;
  mode?: "create" | "update" | "view";
  labelWidth: number;
  onLabelLayout: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
}

const BasicInformation = ({
  data,
  mode,
  definations,
  labelWidth,
  onLabelLayout,
  openInputModal,
  openRadioModal,
}: Props) => {
  const [image, setImage] = useState<ImageResult | null>(null);
  const [audios] = useState(() => {
    const aus: { tags: string[] | null; uri: string }[] = [];
    data.audios.map((item) => {
      const url = item.url[0]?.mp3Url;
      const tags = item.tags || null;
      if (url) return aus.push({ tags, uri: url });
    });
    return aus;
  });
  const [selectedAudio, setSelectedAudio] =
    useState<DocumentPickerAsset | null>(() => {
      if (audios[0])
        return {
          name: "default",
          uri: audios[0].uri,
        };
      return null;
    });

  const sound = useState<Audio.Sound | null>(null);
  const { theme } = useTheme();
  const ipas = useMemo(() => data.ipas, [data.ipas]);

  return (
    <View>
      <View className="flex-row items-center gap-2 mb-6">
        <View className="flex-row items-center gap-2 mt-2 flex-1">
          <View className="flex-row items-center justify-center gap-2">
            {/* <AppText></AppText> */}
            {mode !== "view" && (
              <Animated.View entering={SlideInLeft} exiting={SlideOutLeft}>
                <AudioPicker onAudioChange={setSelectedAudio} />
              </Animated.View>
            )}
            <PhatAm
              size="small"
              audio={selectedAudio}
              sound={sound}
              disabled={!selectedAudio?.uri}
            />

            {mode !== "view" && (
              <Animated.View entering={SlideInRight} exiting={SlideOutRight}>
                <AudioRecoder onAudioChange={setSelectedAudio} />
              </Animated.View>
            )}
          </View>

          <TouchableOpacity
            onPress={() =>
              openInputModal({ title: "Phiên âm", field: "phienAm" })
            }
            disabled={mode === "view"}
            className="flex-1 flex-row"
          >
            {mode !== "view" && (
              // Do scale ngược nên hiệu ứng animation cũng bị ngược
              // Thực tế nó sẽ ra vào bên trái
              <View className="-scale-x-100 mr-2">
                <EditIcon in="slideInRight" out="slideOutRight" />
              </View>
            )}
            <PhienAm> {ipas?.[0]?.value}</PhienAm>
          </TouchableOpacity>
        </View>

        <View className="items-center flex-row gap-2">
          <AppIcon branch="antd" size={20} color="primary" name={"eye"} />
          <View className="h-10 w-14 bg-red-300 rounded"></View>
        </View>
      </View>

      <View className="items-center justify-center mb-2">
        <AppText size={28} font="MulishBold" color="secondary">
          Buổi hẹn
        </AppText>
      </View>

      <View className="mb-6 items-center justify-center">
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

      <View className="">
        <AppTitle title="Định nghĩa 📖" />
      </View>
      <Divider />
      <View className="py-2">
        <View>
          {definations.map((item, index) => {
            const examples = item.examples;
            const mainDefinition = item.value[0];
            const subDefinitions = item.value.slice(0);

            return (
              <View key={index}>
                {index !== 0 && <Divider style={{ marginVertical: 14 }} />}
                <AppText color="subText1">
                  {mainDefinition[0].toUpperCase()}
                  {mainDefinition.slice(1)}
                </AppText>

                <View className="mt-1.5">
                  {subDefinitions.map((subDefinition, index2) => {
                    return (
                      <View key={"sub-" + index2}>
                        <AppText
                          key={index2}
                          size={"sm"}
                          font="MulishLight"
                          color="subText1"
                        >
                          {subDefinition[0].toUpperCase()}
                          {subDefinition.slice(1)}
                        </AppText>
                      </View>
                    );
                  })}
                </View>

                <View className="mt-4 pl-2 gap-4">
                  {/* <AppText>Example</AppText> */}
                  {examples.map((example, index2) => {
                    const origins = example.exampleTranslate;
                    return (
                      <View key={"a" + index2}>
                        <View></View>
                        <AppText
                          key={index2}
                          size={"sm"}
                          font="MulishLightItalic"
                          color="primary"
                        >
                          <AppText
                            size={"sm"}
                            font="MulishRegularItalic"
                            color="primary"
                          >
                            Ex{index2 + 1}:
                          </AppText>{" "}
                          {example.value[0].toUpperCase()}
                          {example.value.slice(1)}
                        </AppText>

                        <View className="mt-1">
                          {[1].map((origin, index3) => {
                            return (
                              <View
                                key={"b" + index3}
                                className="flex-row items-center gap-1"
                              >
                                <FontAwesome
                                  name="hand-o-right"
                                  size={12}
                                  // color={"subText1"}
                                />
                                <AppText
                                  key={index3}
                                  size={"sm"}
                                  font="MulishLightItalic"
                                  color="subText1"
                                >
                                  {"Test translate"}
                                </AppText>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
        {/* <Information
          mode={mode}
          value={"Cái này là mô phỏng của chức năng định nghĩa"}
        /> */}
      </View>
    </View>
  );
};

export default BasicInformation;
