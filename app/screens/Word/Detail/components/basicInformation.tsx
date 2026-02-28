import AppAddIcon from "@/components/AppAddIcon";
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
import useModalStore from "@/stores/modalStore";
import { AudioType } from "@/stores/recordingStore";
import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
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
import { WordType } from "../../data";
import WordDefinitions from "./definitions";
import SenseNote from "./senseNote";
import SenseUsage from "./senseUsage";

interface Props {
  word: string;
  definition: WordType["definition"];
  usage: WordType["definition"];
  note: string;
  image?: string;
  translates: WordType["translates"];
  examples: WordType["examples"];
  metadata: WordType["metadata"];
  mode?: "create" | "update" | "view";
  languageMode: 1 | 2;
  labelWidth: number;
  onLabelLayout: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
}

const BasicInformation = ({
  word,
  metadata,
  mode,
  translates,
  definition,
  usage,
  note,
  image,
  examples,
  labelWidth,
  onLabelLayout,
  openInputModal,
  openRadioModal,
  ...props
}: Props) => {
  // const [image, setImage] = useState<ImageResult | null>(null);
  const [audios] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState<
    DocumentPickerAsset | AudioType | null
  >(null);

  const sound = useState<Audio.Sound | null>(null);
  const { theme } = useTheme();
  const ipas = useMemo(() => metadata?.ipas, [metadata?.ipas]);

  const { width } = useWindowDimensions();
  const { present } = useBottomSheet();
  const { setGlobalModal } = useModalStore();

  const onShowMoreDefinitions = () => {
    present({
      size: "full",
      render: () => (
        <MoreDefinitions
          definitions={[
            { value: "Lấy của người ta", id: "1" },
            { value: "Lấy của người ta", id: "2" },
            { value: "Lấy của người ta", id: "3" },
          ]}
        />
      ),
      title: "Other definitions",
    });
  };

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <View className="flex-row items-center gap-1 flex-1">
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
      </View>
      <View className="my-4 items-center justify-center">
        {props.languageMode === 2 && (
          <Animated.View
            entering={FadeInUp}
            // exiting={FadeOutUp}
            className="mb-2 w-full"
          >
            <View className="flex-row gap-2 items-center flex-wrap mb-1">
              {translates?.length ? (
                translates.map((item, index) => (
                  <View
                    key={item}
                    className="px-2 py-0.5 rounded"
                    style={{ backgroundColor: theme.disabled + "30" }}
                  >
                    <AppText size={"sm"} font="MulishLightItalic">
                      {item}
                    </AppText>
                  </View>
                ))
              ) : (
                // <View className="flex-row items-center py-0.5">
                //   <AppText
                //     numberOfLines={1}
                //     color="subText1"
                //     // font="MulishLight"
                //     size={"sm"}
                //   >
                //     {translates.join(", ")}
                //   </AppText>
                // </View>
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
          {image ? (
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
                source={{
                  uri: image,
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
        <View className="flex-row justify-between items-center h-8">
          <View className="flex-row items-center gap-2">
            <AppIcon
              style={{ width: 14 }}
              branch="fa6"
              name={"book"}
              size={14}
              color="title"
            />
            <AppTitle title="Definition" />
          </View>

          <View className="flex-row items-center gap-1">
            <AppText
              className="h-full"
              onPress={onShowMoreDefinitions}
              size="xs"
              color="primary"
              font="MulishLightItalic"
            >
              Show More
            </AppText>

            <AppIcon
              name={"chevron-right"}
              size={14}
              color="primary"
              branch="feather"
            />
          </View>
        </View>
        <Divider />
        <View>
          <View>
            <WordDefinitions
              word={word}
              definition={definition}
              examples={examples}
              languageMode={props.languageMode}
            />
          </View>
        </View>
      </Animated.View>

      <SenseUsage word={word} languageMode={props.languageMode} usage={usage} />

      <SenseNote word={word} note={note} />
    </View>
  );
};

export default BasicInformation;

type MoreDefinitionsProps = {
  definitions: { value: string; id: string }[];
  // examples: WordType["examples"];
};
const MoreDefinitions = ({ definitions }: MoreDefinitionsProps) => {
  return (
    <View className="px-3 mt-4">
      {definitions.map((item, index) => (
        <View key={index}>
          <WordDefinitions
            examples={[]}
            word=""
            key={index}
            definition={{ ...item, translate: "", languageCode: "", subId: "" }}
            languageMode={1}
          />
          {index !== definitions.length - 1 && (
            <Divider style={{ marginVertical: 8 }} />
          )}
        </View>
      ))}
    </View>
  );
};
