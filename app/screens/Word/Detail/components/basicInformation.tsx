import AppAddIcon from "@/components/AppAddIcon";
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
import useModalStore from "@/stores/modalStore";
import { AudioType } from "@/stores/recordingStore";
import { startRecording } from "@/utils/audioRecord";
import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
import { useMemo, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { Divider } from "react-native-paper";
import Animated, { FadeInUp, LinearTransition } from "react-native-reanimated";
// import {
//   ExpoSpeechRecognitionModule,
//   useSpeechRecognitionEvent,
// } from "expo-speech-recognition";
// import { initWhisper } from "whisper.rn";
import { WordType } from "../../data";
import { textToSpeech } from "../utils";
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

  const [audio, setAudio] = useState<AudioType | null>(null);

  const handleStartRecording = () => {
    startRecording(handleStopRecording);
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleStopRecording = async (result: AudioType | null) => {
    if (!result) return;

    // Kiểm tra thời lượng nếu cần
    if (result.duration > 10000) {
      // Ví dụ 10s cho thoải mái
      return alert("Ghi âm quá dài, vui lòng nói ngắn gọn.");
    }

    try {
      setIsProcessing(true); // Hiển thị loading trên UI

      // 1. Khởi tạo Whisper Context (Nên làm 1 lần ở useEffect hoặc Global)
      // Giả sử bạn đã có file model trong máy
      // const whisperContext = await initWhisper({
      //   filePath: "path/to/ggml-tiny.en.bin",
      // });

      // 2. Transcribe file từ URI
      // const { promise } = await whisperContext.transcribe(result.uri, {
      //   language: "en", // Ngôn ngữ mục tiêu
      //   maxLen: 1, // Tối ưu cho việc nhận diện từ đơn/câu ngắn
      // });

      // const { text } = await promise;

      // console.log("📝 Kết quả Whisper:", text);

      // // 3. Đưa text vào ô search hoặc xử lý tiếp theo logic của Flashwise
      // setSearchText(text.trim());
    } catch (error) {
      console.error("Whisper Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");

  // useSpeechRecognitionEvent("start", () => setRecognizing(true));
  // useSpeechRecognitionEvent("end", () => setRecognizing(false));
  // useSpeechRecognitionEvent("result", (event) => {
  //   setTranscript(event.results[0]?.transcript);
  // });
  // useSpeechRecognitionEvent("error", (event) => {
  //   console.log("error code:", event.error, "error message:", event.message);
  // });

  // const handleStart = async () => {
  //   const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  //   if (!result.granted) {
  //     console.warn("Permissions not granted", result);
  //     return;
  //   }
  //   // Start speech recognition
  //   ExpoSpeechRecognitionModule.start({
  //     lang: "en-US",
  //     interimResults: true,
  //     continuous: false,
  //   });
  // };

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <View className="flex-row items-center gap-1 flex-1">
          {/* {!recognizing ? (
            <Button title="Start" onPress={handleStart} />
          ) : (
            <Button
              title="Stop"
              onPress={() => ExpoSpeechRecognitionModule.stop()}
            />
          )}  */}

          <ScrollView>
            <Text>{transcript}</Text>
          </ScrollView>
          <View className="flex-row items-center justify-center gap-2">
            {!selectedAudio?.uri ? (
              <TouchableOpacity
                onPress={() => textToSpeech(word)}
                style={{
                  backgroundColor: theme.secondary,
                  width: 40,
                  height: 40,
                }}
                className=" border-gray-400 rounded-lg h-16 w-16 items-center justify-center"
              >
                <AppIcon
                  name={"volume-2"}
                  branch="feather"
                  color="white"
                  size={32}
                />
              </TouchableOpacity>
            ) : (
              <PhatAm
                size="small"
                audio={selectedAudio}
                sound={sound}
                disabled={!selectedAudio?.uri}
              />
            )}
          </View>

          <AppButton title="Test STT" onPress={handleStartRecording} />

          <AppText>{searchText}</AppText>

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
            definition={{ ...item, translate: "", subId: "" }}
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
