import AppAddIcon from "@/components/AppAddIcon";
import AppIcon from "@/components/AppIcon";
import { AppPressable } from "@/components/AppPressable";
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
import useModalStore from "@/stores/modalStore";
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
import WordDefinitions from "./definitions";
import SenseNote from "./senseNote";
import SenseUsage from "./senseUsage";

interface Props {
  word: string;
  definitions: WordType["definitions"];
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
  definitions,
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
  const { setGlobalModal } = useModalStore();

  const onShowMoreDefinitions = () => {
    present({
      size: "full",
      render: () => (
        <MoreDefinitions
          items={definitions.slice(1)}
          languageMode={props.languageMode}
        />
      ),
      title: "Other definitions",
    });
  };

  const showAddDefinition = () => {
    setGlobalModal({
      type: "prompt",
      title: "Add definition",
      placeholder: `English definition for "${props.word}"`,
    });
  };

  const showAddNativeDefinition = () => {
    setGlobalModal({
      type: "prompt",
      title: "Add definition",
      placeholder: `Vietnamese definition for "${props.word}"`,
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
            hitSlop={20}
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
            hitSlop={20}
            onPress={() => alert("Nhảy sense")}
          >
            <AppIcon branch="antd" color="primary" name={"right"} size={20} />
          </Pressable>
        </View>
      </View>
      <View className="my-10 items-center justify-center">
        {props.languageMode === 2 && (
          <Animated.View
            entering={FadeInUp}
            // exiting={FadeOutUp}
            className="mb-2 w-full"
          >
            <View>
              {translates.length ? (
                <View className="flex-row items-center py-0.5">
                  <AppText
                    numberOfLines={1}
                    color="subText1"
                    // font="MulishLight"
                    size={"sm"}
                  >
                    {translates.map((item) => item.value).join(", ")}
                  </AppText>
                </View>
              ) : (
                <View className="flex-row items-center justify-between">
                  <AppText
                    color="subText3"
                    font="MulishRegularItalic"
                    size={"sm"}
                  >
                    No translations
                  </AppText>

                  <AppAddIcon size="sm" />
                </View>
              )}
            </View>
          </Animated.View>
        )}

        <Animated.View layout={LinearTransition}>
          {true ? (
            <View
              style={{
                elevation: 4,
                overflow: "hidden",
                width: width - 14,
                height: ((width - 14) / 16) * 9,
              }}
              className="rounded-lg"
            >
              <Image
                source={{
                  uri: "https://cdn-web.onlive.vn/onlive/image-news/%C4%91i%20date%20thumb.jpg",
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
          ) : (
            <AppIcon
              name={"image"}
              branch="feather"
              size={140}
              color="subText3"
            />
          )}
        </Animated.View>
      </View>
      <Animated.View layout={LinearTransition}>
        <View className="flex-row justify-between items-center">
          <AppTitle title="Definition 📖" />
          {definitions.length > 1 && (
            <View className="flex-row items-center gap-1">
              <AppText
                style={{
                  height: "100%",
                  paddingVertical: 8,
                }}
                onPress={onShowMoreDefinitions}
                size="xs"
                color="primary"
                font="MulishLightItalic"
              >
                {definitions.length - 1} More
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
        <View className="py-3">
          <View style={{ marginTop: -10 }}>
            {definitions.slice(0, 1).length ? (
              definitions
                .slice(0, 1)
                .map((item, index) => (
                  <WordDefinitions
                    word="tip"
                    key={index}
                    item={item}
                    index={index}
                    languageMode={props.languageMode}
                  />
                ))
            ) : (
              <AppPressable
                onPress={showAddDefinition}
                className="py-3 flex-row justify-between items-center"
              >
                <AppText
                  color="subText2"
                  font="MulishRegularItalic"
                  size={"sm"}
                >
                  Not have English definition
                </AppText>

                <AppAddIcon onPress={() => Alert.alert("dmm")} size="sm" />
              </AppPressable>
            )}
          </View>

          {props.languageMode === 2 && (
            <AppPressable
              onPress={showAddNativeDefinition}
              style={{
                marginHorizontal: -8,
                marginVertical: 8,
                backgroundColor: theme.secondary + "15",
                padding: 8,
              }}
              className="py-3  flex-row justify-between items-center"
            >
              <AppText color="subText2" font="MulishRegularItalic" size={"sm"}>
                Not have Vietnamese definition
              </AppText>

              <AppAddIcon size="sm" />
              {/* {definitions.slice(0, 1).map((item, index) => (
                <WordDefinitions
                  word="tip"
                  key={index}
                  item={item}
                  index={index}
                  languageMode={props.languageMode}
                />
              ))} */}
            </AppPressable>
          )}
        </View>
      </Animated.View>

      <SenseUsage
        word={props.word}
        languageMode={props.languageMode}
        usage={{ id: "1", value: definitions?.[2]?.value[0] || "" }}
        usageTranslate={{ id: "1", value: definitions?.[3]?.value[0] || "" }}
      />

      <SenseNote
        word={props.word}
        note={{ id: "1", value: definitions?.[2]?.value[0] || "" }}
      />
    </View>
  );
};

export default BasicInformation;

type MoreDefinitionsProps = {
  items: WordType["definitions"];
  languageMode: 1 | 2;
};
const MoreDefinitions = ({ items, languageMode }: MoreDefinitionsProps) => {
  return (
    <View className="px-3 mt-4">
      {items.map((item, index) => (
        <View key={index}>
          <WordDefinitions
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
