import { useTheme } from "@/providers/Theme";
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
import useModalStore from "@/stores/modalStore";
import { AudioType } from "@/stores/recordingStore";
import { startRecording } from "@/utils/audioRecord";
import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Divider } from "react-native-paper";
import Animated, { FadeInUp, LinearTransition } from "react-native-reanimated";
// import {
//   ExpoSpeechRecognitionModule,
//   useSpeechRecognitionEvent,
// } from "expo-speech-recognition";
// import { initWhisper } from "whisper.rn";
import { lightTheme } from "@/configs/theme";
import { useAppStore } from "@/stores/appStore";
import { SenseType } from "../../data";
import AppImage from "@/components/AppImage";
import { SkeletonReact } from "@/components/skeleton/ReactSkeleton";
import { findSenseImage, SenseImage } from "@/services/senseImage";
import { useWordLoading } from "../loadingContext";
import { getLangTranslate, textToSpeech } from "../utils";
import SectionHeader from "./sectionHeader";
import WordDefinitions from "./definitions";
import MainSenseButton from "./mainSenseButton";
import SenseNote from "./senseNote";
import SenseUsage from "./senseUsage";

interface Props {
  word: string;
  sense: SenseType;
  note?: string;
  mode?: "create" | "update" | "view";
  labelWidth: number;
  onLabelLayout: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
}

const BasicInformation = ({
  word,
  mode,
  sense,
  note,
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
  const { settings, dbService } = useAppStore();
  const { theme } = useTheme();
  const translations = useMemo(
    () =>
      getLangTranslate(
        sense?.contents?.translations,
        settings?.translate_language,
      ),
    [sense?.contents?.translations],
  );

  const toggleLanguageMode = () =>
    dbService?.setShowTranslation(!settings?.show_translation);
  const ipas = useMemo(() => sense?.ipas, [sense?.ipas]);
  const { width } = useWindowDimensions();
  const { present } = useBottomSheet();
  const { setGlobalModal } = useModalStore();
  const isWordLoading = useWordLoading();

  // Ảnh: server (image_preview) ưu tiên; chưa có thì tạm lấy từ Pixabay theo image_keywords
  const [fallbackImage, setFallbackImage] = useState<SenseImage | null>(null);
  const keywords: string[] | undefined = (sense as any)?.metadata?.image_keywords;
  useEffect(() => {
    if (sense.image_preview) return;
    let alive = true;
    findSenseImage(keywords, word).then((img) => alive && setFallbackImage(img));
    return () => {
      alive = false;
    };
  }, [sense.image_preview, keywords?.join(","), word]);
  const imageUri = sense.image_preview || fallbackImage?.url;

  // const onShowMoreDefinitions = () => {
  //   present({
  //     size: "full",
  //     render: () => (
  //       <MoreDefinitions
  //         definitions={[
  //           { value: "Lấy của người ta", id: "1" },
  //           { value: "Lấy của người ta", id: "2" },
  //           { value: "Lấy của người ta", id: "3" },
  //         ]}
  //       />
  //     ),
  //     title: "Other definitions",
  //   });
  // };

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
      <View className="flex-row items-center gap-3">
        {!selectedAudio?.uri ? (
          <TouchableOpacity
            onPress={() => textToSpeech(word)}
            activeOpacity={0.8}
            style={{ backgroundColor: theme.primary, width: 44, height: 44 }}
            className="rounded-full items-center justify-center"
          >
            <AppIcon name={"volume-2"} branch="feather" color="white" size={22} />
          </TouchableOpacity>
        ) : (
          <PhatAm
            size="small"
            audio={selectedAudio}
            sound={sound}
            disabled={!selectedAudio?.uri}
          />
        )}
        <TouchableOpacity
          onPress={() => openInputModal({ title: "Phiên âm", field: "phienAm" })}
          disabled={mode === "view"}
        >
          <PhienAm> {ipas?.[0]?.value || ""}</PhienAm>
        </TouchableOpacity>
        <View className="flex-1 items-end">
          <MainSenseButton sense={sense} />
        </View>
      </View>

      <View className="mt-4 mb-2">
        {settings?.show_translation && (
          <Animated.View entering={FadeInUp} className="mb-3 w-full">
            <View className="flex-row gap-2 items-center flex-wrap">
              {translations?.length ? (
                translations.map((item) => (
                  <View
                    key={item}
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: theme.primary + "14" }}
                  >
                    <AppText size={"sm"} font="MulishSemiBold" color="primary">
                      {item}
                    </AppText>
                  </View>
                ))
              ) : isWordLoading ? (
                [84, 64, 96].map((w) => (
                  <SkeletonReact key={w} width={w} height={26} style={{ borderRadius: 13 }} />
                ))
              ) : (
                <View className="flex-row items-center justify-between w-full">
                  <AppText color="subText3" font="MulishRegularItalic" size={"sm"}>
                    Chưa có bản dịch ngắn
                  </AppText>
                  <AppAddIcon size="sm" />
                </View>
              )}
            </View>
          </Animated.View>
        )}

        <Animated.View layout={LinearTransition}>
          <View
            style={{
              width: "100%",
              // Có ảnh (hoặc đang tải) giữ khung 16:9; chưa có thì chỉ một dải thấp, khỏi chiếm cả màn hình
              ...(imageUri || isWordLoading ? { aspectRatio: 16 / 9 } : { height: 56 }),
              backgroundColor: theme.card,
            }}
            className="rounded-2xl overflow-hidden items-center justify-center"
          >
            {imageUri ? (
              <>
                <AppImage
                  source={{ uri: imageUri }}
                  style={{ width: "100%", height: "100%" }}
                />
                {!sense.image_preview && fallbackImage && (
                  <View
                    className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#00000088" }}
                  >
                    <AppText size="tiny" color="white">
                      {fallbackImage.credit}
                    </AppText>
                  </View>
                )}
              </>
            ) : isWordLoading ? (
              <SkeletonReact width="100%" height="100%" style={{ borderRadius: 0 }} />
            ) : (
              <View className="flex-row items-center gap-2">
                <AppIcon name="image" branch="feather" size={18} color={theme.subText3} />
                <AppText size="xs" color="subText3">
                  Chưa có hình minh hoạ
                </AppText>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
      <Animated.View className="mt-4" layout={LinearTransition}>
        <SectionHeader
          icon={<AppIcon branch="fa6" name={"book"} size={14} color="title" />}
          title="Definition"
        />
        <View>
          <View>
            <WordDefinitions
              word={word}
              definition={sense.contents?.definition}
              examples={sense.contents?.examples || []}
            />
          </View>
        </View>
      </Animated.View>

      <SenseUsage word={word} usage={sense.contents?.usage} />

      <SenseNote word={word} />
    </View>
  );
};

export default BasicInformation;

// type MoreDefinitionsProps = {
//   definitions: { value: string; id: string }[];
//   // examples: WordType["examples"];
// };
// const MoreDefinitions = ({ definitions }: MoreDefinitionsProps) => {
//   return (
//     <View className="px-3 mt-4">
//       {definitions.map((item, index) => (
//         <View key={index}>
//           <WordDefinitions
//             examples={[]}
//             word=""
//             key={index}
//             definition={{ ...item, translate: "", subId: "" }}
//           />
//           {index !== definitions.length - 1 && (
//             <Divider style={{ marginVertical: 8 }} />
//           )}
//         </View>
//       ))}
//     </View>
//   );
// };
