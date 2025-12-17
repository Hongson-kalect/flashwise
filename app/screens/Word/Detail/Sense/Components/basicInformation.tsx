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
import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
import { ImageResult } from "expo-image-manipulator";
import { useMemo, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Divider } from "react-native-paper";
import Animated, { FadeInUp, LinearTransition } from "react-native-reanimated";
import { WordType } from "../../../data";
import WordDefinitions from "../../components/definitions";

interface Props {
  definitions: WordType["definitions"];
  data: WordType["wordInfo"];
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

  const { width } = useWindowDimensions();
  const { present } = useBottomSheet();

  const onShowMoreDefinitions = () => {
    present({
      size: "full",
      render: () => (
        <MoreDefinitions
          items={definitions.slice(2)}
          languageMode={props.languageMode}
        />
      ),
      title: "Other definitions",
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

        {/* <View className="flex-row items-center gap-2">
          <Pressable
            hitSlop={10}
            style={{ backgroundColor: theme.primary }}
            className="h-10 w-10 rounded-lg items-center justify-center"
            onPress={() => alert("Nhảy sense")}
          >
            <AppIcon color="white" branch="antd" name={"left"} size={20} />
          </Pressable>
          <View className="items-center justify-center">
            <AppText color="subText1" font="MulishBold">
              Sense 1/6
            </AppText>
          </View>
          <Pressable
            className="h-10 w-10 rounded-lg  items-center justify-center"
            hitSlop={10}
            style={{ backgroundColor: theme.primary }}
            onPress={() => alert("Nhảy sense")}
          >
            <AppIcon branch="antd" color="white" name={"right"} size={20} />
          </Pressable>
        </View> */}

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
              <AudioPicker onAudioChange={setSelectedAudio} />
            </View>

            <View>
              <AudioRecoder onAudioChange={setSelectedAudio} />
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

      {props.languageMode === 2 && (
        <Animated.View
          entering={FadeInUp}
          // exiting={FadeOutUp}
          className="items-center justify-center mt-6"
        >
          <AppText size={40} font="MulishSemiBold" color="primary">
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
              // font="MulishLight"
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
        className="my-10 items-center justify-center"
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
          {definitions.length > 2 && (
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
                {definitions.length - 2} Nghĩa khác
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
            {definitions.slice(0, 2).map((item, index) => (
              <WordDefinitions
                key={index}
                item={item}
                index={index}
                languageMode={props.languageMode}
              />
            ))}
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

type MoreDefinitionsProps = {
  items: WordType["definitions"];
  languageMode: 1 | 2;
};
const MoreDefinitions = ({ items, languageMode }: MoreDefinitionsProps) => {
  return (
    <View className="px-3 mt-4">
      {items.map((item, index) => (
        <WordDefinitions
          key={index}
          item={item}
          index={index}
          languageMode={languageMode}
        />
      ))}
    </View>
  );
};
