import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import EditIcon from "@/components/icons/editIcon";
import { BoldText } from "@/components/output/BoldText";
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
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Divider } from "react-native-paper";
import Animated, {
  FadeInUp,
  LinearTransition,
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
  translates: WordType["translates"];
  mode?: "create" | "update" | "view";
  languageMode: 1 | 2;
  toggleLanguageMode: () => void;
  labelWidth: number;
  onLabelLayout: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
}

const BasicInformation = ({
  data,
  mode,
  translates,
  definations,
  labelWidth,
  onLabelLayout,
  openInputModal,
  openRadioModal,
  ...props
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
  const swapLang = () => {
    props.toggleLanguageMode();
  };

  const { width } = useWindowDimensions();

  return (
    <View>
      <View className="flex-row items-center gap-2">
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

        <Pressable
          hitSlop={10}
          onPress={swapLang}
          className="items-center flex-row gap-2"
        >
          {/* <AppIcon branch="antd" size={20} color="primary" name={"eye"} /> */}
          <Animated.View
            layout={LinearTransition.springify()}
            style={
              props.languageMode !== 2 ? backFlagPosition : frontFlagPosition
            }
            className="h-8 w-10 rounded overflow-hidden"
          >
            <Image
              className="w-full h-full"
              source={require("@/assets/images/flags/vn.png")}
            />
          </Animated.View>
          <Animated.View
            layout={LinearTransition.springify()}
            style={
              props.languageMode === 2 ? backFlagPosition : frontFlagPosition
            }
            className="h-8 w-10 rounded overflow-hidden"
          >
            <Image
              className="w-full h-full"
              source={require("@/assets/images/flags/en.png")}
            />
          </Animated.View>
        </Pressable>
      </View>

      {props.languageMode === 2 && (
        <Animated.View
          entering={FadeInUp}
          // exiting={FadeOutUp}
          className="items-center justify-center mt-2 mb-2"
        >
          <AppText size={28} font="MulishBold" color="secondary">
            {translates[0]?.value || (
              <AppText color="subText3" font="MulishSemiBoldItalic" size={28}>
                Chưa có bản dịch
              </AppText>
            )}
          </AppText>

          <View className="flex-row items-center justify-center px-4">
            <AppText
              numberOfLines={1}
              color="subText2"
              font="MulishLight"
              size={"sm"}
            >
              {translates
                .slice(1)
                .map((item) => item.value)
                .join(", ")}
            </AppText>
          </View>
        </Animated.View>
      )}

      <Animated.View
        layout={LinearTransition}
        className="my-8 items-center justify-center"
      >
        {true ? (
          // {image?.uri ? (
          <View
            style={{
              elevation: 4,
              overflow: "hidden",
              width: width - 28,
              height: ((width - 28) / 16) * 9,
            }}
            className="rounded-lg"
          >
            <Image
              // source={{ uri: image?.uri }}

              source={{
                uri: "https://cdn-web.onlive.vn/onlive/image-news/%C4%91i%20date%20thumb.jpg",
              }}
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
      </Animated.View>
      <Animated.View layout={LinearTransition}>
        <View className="flex-row justify-between items-center">
          <AppTitle title="Định nghĩa 📖" />
          {definations.length > 2 && (
            <View className="flex-row items-center gap-1">
              <AppText size="xs" color="primary" font="MulishLightItalic">
                {definations.length - 2} Nghĩa khác
              </AppText>

              <AppIcon
                name={"chevron-right"}
                size={14}
                color="primary"
                branch="feather"
              />
            </View>
          )}
        </View>
        <Divider />
        <View className="py-2">
          <View>
            {definations.slice(0, 2).map((item, index) => {
              const examples = item.examples;
              const mainDefinition = item.value[0];
              const subDefinitions = item.value.slice(1);

              return (
                <View key={index}>
                  {index !== 0 && <Divider style={{ marginVertical: 14 }} />}
                  <AppText color="subText1">
                    <AppIcon
                      name={"star"}
                      size={12}
                      style={{ marginRight: 4 }}
                      color="secondary"
                      branch="antd"
                    />
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
                      const upperCase =
                        example.value[0].toUpperCase() + example.value.slice(1);
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
                              <AppIcon
                                style={{ transform: [{ scaleX: -1 }] }}
                                color="primary"
                                branch="antd"
                                name={"edit"}
                                size={12}
                              />
                              :
                            </AppText>{" "}
                            <BoldText
                              size={"sm"}
                              color="subText1"
                              boldColor="primary"
                              font="MulishRegularItalic"
                              boldFont="MulishBoldItalic"
                              text={upperCase}
                              bold={example.bold}
                            />
                          </AppText>
                          {props.languageMode === 2 ? (
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
                          ) : null}
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
      </Animated.View>
    </View>
  );
};

export default BasicInformation;

const backFlagPosition = {
  position: "absolute",
  left: -6,
  top: -6,
  // zIndex: 1,
};

const frontFlagPosition = {
  position: "relative",
  right: 0,
  zIndex: 1,
  top: 0,
};
