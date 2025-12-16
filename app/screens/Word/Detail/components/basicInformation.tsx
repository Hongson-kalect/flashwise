import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import PhatAm from "@/components/PhatAm";
import PhienAm from "@/components/PhienAm";
import {
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "@/interfaces/word";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { AudioType } from "@/stores/recordingStore";
import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
import { ImageResult } from "expo-image-manipulator";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  LayoutChangeEvent,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Divider } from "react-native-paper";
import Animated, { FadeInUp, LinearTransition } from "react-native-reanimated";
import { WordInfoType, WordType } from "../../data";
import WordDefinations from "./definations";

interface Props {
  definations: WordType["definations"];
  data: WordInfoType;
  translates: WordType["translates"];
  mode?: "create" | "update" | "view";
  languageMode: 1 | 2;
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
  const [selectedAudio, setSelectedAudio] = useState<
    DocumentPickerAsset | AudioType | null
  >(() => {
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

  const { width } = useWindowDimensions();
  const { present } = useBottomSheet();

  const onShowMoreDefinations = () => {
    present({
      size: "full",
      render: () => (
        <MoreDefinations
          items={definations.slice(1)}
          languageMode={props.languageMode}
        />
      ),
      title: "Other definations",
    });
  };

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="flex-row items-center justify-center gap-2">
            <PhatAm
              size="small"
              audio={selectedAudio}
              sound={sound}
              disabled={!selectedAudio?.uri}
            />
          </View>

          <TouchableOpacity
            onPress={() =>
              openInputModal({ title: "Phiên âm", field: "phienAm" })
            }
            disabled={mode === "view"}
            className="flex-1 flex-row"
          >
            <PhienAm> {ipas?.[0]?.value}</PhienAm>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            hitSlop={10}
            className="h-10 w-10 rounded-lg items-center justify-center"
            onPress={() => alert("Nhảy sense")}
          >
            <AppIcon color="primary" branch="antd" name={"left"} size={20} />
          </Pressable>
          <View className="items-center justify-center">
            <AppText color="primary" font="MulishBold" size={"lg"}>
              <AppText color="subText2" size={"sm"}>
                sense
              </AppText>{" "}
              1{" "}
              <AppText color="subText2" size={"sm"}>
                /6
              </AppText>
            </AppText>
          </View>
          <Pressable
            className="h-10 w-10 rounded-lg  items-center justify-center"
            hitSlop={10}
            onPress={() => alert("Nhảy sense")}
          >
            <AppIcon branch="antd" color="primary" name={"right"} size={20} />
          </Pressable>
        </View>

        {/* Edit Line */}

        {/* <Pressable
          hitSlop={10}
          onPress={swapLang}
          className="items-center flex-row gap-2"
        >
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
        </Pressable> */}
      </View>

      {/* {mode !== "view" && (
        <Animated.View
          entering={SlideInRight}
          className="flex-row items-center justify-between mt-2"
        >
          <View className="gap-2 flex-row items-center">
            <View>
              <AudioPicker size="small" onAudioChange={setSelectedAudio} />
            </View>

            <View>
              <AudioRecoder size="small" onAudioChange={setSelectedAudio} />
            </View>
          </View>
          <View>
            <AppButton onPress={() => {}} type="secondary">
              <AppIcon name="external-link" color="white" branch="feather" />
              <AppText color="white">Manage sense</AppText>
            </AppButton>
          </View>
        </Animated.View>
      )} */}

      <View className="my-10 items-center justify-center">
        {props.languageMode === 2 && (
          <Animated.View
            entering={FadeInUp}
            // exiting={FadeOutUp}
            className="mb-2 w-full"
          >
            <View className="flex-row items-center px-2">
              {!translates.length ? (
                <AppText
                  numberOfLines={1}
                  color="subText1"
                  // font="MulishLight"
                  size={"sm"}
                >
                  {translates.map((item) => item.value).join(", ")}
                </AppText>
              ) : (
                <AppText
                  color="subText3"
                  font="MulishRegularItalic"
                  size={"sm"}
                >
                  No translations{" "}
                  <AppText
                    onPress={() => Alert.alert("DMM")}
                    color="success"
                    size={"sm"}
                    font="MulishSemiBoldItalic"
                  >
                    + Add translations.
                  </AppText>
                </AppText>
              )}
            </View>
          </Animated.View>
        )}

        <Animated.View layout={LinearTransition}>
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
      </View>
      <Animated.View layout={LinearTransition}>
        <View className="flex-row justify-between items-center">
          <AppTitle title="Defination 📖" />
          {definations.length > 1 && (
            <View className="flex-row items-center gap-1">
              <AppText
                style={{
                  height: "100%",
                  paddingVertical: 8,
                }}
                onPress={onShowMoreDefinations}
                size="xs"
                color="primary"
                font="MulishLightItalic"
              >
                {definations.length - 1} More
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
          <View style={{ marginTop: -10 }}>
            {definations.slice(0, 1).map((item, index) => (
              <WordDefinations
                word="tip"
                key={index}
                item={item}
                index={index}
                languageMode={props.languageMode}
              />
            ))}
          </View>

          {props.languageMode === 2 && (
            <View
              style={{
                marginHorizontal: -8,
                marginVertical: 8,
                backgroundColor: theme.secondary + "15",
                padding: 8,
              }}
            >
              <View className="py-2">
                <AppText
                  color="subText2"
                  font="MulishRegularItalic"
                  size={"sm"}
                >
                  Not have Vietnamese defination
                </AppText>

                <View className="mt-2 flex-row justify-start">
                  <AppButton size="sm" onPress={() => {}} type="success">
                    <AppIcon
                      name="external-link"
                      color="white"
                      size={16}
                      branch="feather"
                    />
                    <AppText color="white" size={"sm"}>
                      Add
                    </AppText>
                  </AppButton>
                </View>
              </View>
              {/* {definations.slice(0, 1).map((item, index) => (
                <WordDefinations
                  word="tip"
                  key={index}
                  item={item}
                  index={index}
                  languageMode={props.languageMode}
                />
              ))} */}
            </View>
          )}
        </View>
      </Animated.View>

      <Animated.View layout={LinearTransition}>
        <View className="flex-row justify-between items-center mt-4">
          <AppTitle title="Usage 🔎" />
        </View>
        <Divider />
        <View className="py-2">
          <View>
            {definations.slice(1, 2).map((item, index) => (
              <AppText color="subText1" key={index}>
                {item.value}
              </AppText>
            ))}
          </View>
        </View>

        {props.languageMode === 2 && (
          <View
            style={{
              marginHorizontal: -8,
              marginVertical: 8,
              backgroundColor: theme.secondary + "15",
              padding: 8,
            }}
          >
            <View className="py-2">
              <AppText color="subText2" font="MulishRegularItalic" size={"sm"}>
                Not have usage in Vietnamese
              </AppText>

              <View className="mt-2 flex-row justify-start">
                <AppButton size="sm" onPress={() => {}} type="success">
                  <AppIcon
                    name="external-link"
                    color="white"
                    size={16}
                    branch="feather"
                  />
                  <AppText color="white" size={"sm"}>
                    Add
                  </AppText>
                </AppButton>
              </View>
            </View>
            {/* {definations.slice(1, 2).map((item, index) => (
              <AppText color="subText1" key={index}>
                {item.value}
              </AppText>
            ))} */}
          </View>
        )}
      </Animated.View>

      <Animated.View layout={LinearTransition}>
        <View className="mt-4 rounded-lg py-2">
          <AppText color="subText3" font="MulishLightItalic" size={"sm"}>
            Chưa có ghi chú{" "}
            <AppText
              onPress={() => Alert.alert("DMM")}
              color="success"
              size={"sm"}
              font="MulishSemiBoldItalic"
            >
              + Add note.
            </AppText>
          </AppText>
        </View>

        {/* <View
          style={{ marginHorizontal: -8, paddingHorizontal: 12 }}
          className="mt-4 bg-gray-100 rounded-lg p-3"
        >
          <AppText color="title" size={"md"} font="MulishSemiBoldItalic">
            Note 📝
          </AppText>
          <Divider />
          <View className="py-2">
            <View>
              {definations.slice(2, 3).map((item, index) => (
                <AppText
                  key={index}
                  size={"sm"}
                  color="subText2"
                  font="MulishRegularItalic"
                >
                  {item.value}
                </AppText>
              ))}
            </View>
          </View>
        </View> */}
      </Animated.View>
    </View>
  );
};

export default BasicInformation;

type MoreDefinationsProps = {
  items: WordType["definations"];
  languageMode: 1 | 2;
};
const MoreDefinations = ({ items, languageMode }: MoreDefinationsProps) => {
  return (
    <View className="px-3 mt-4">
      {items.map((item, index) => (
        <View key={index}>
          <WordDefinations
            word=""
            key={index}
            item={item}
            index={index}
            languageMode={languageMode}
          />
          {index !== items.length - 1 && (
            <Divider style={{ marginVertical: 8 }} />
          )}
        </View>
      ))}
    </View>
  );
};
