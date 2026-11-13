import { useTheme } from "@/providers/Theme";
import AppAddIcon from "@/components/AppAddIcon";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";

import PhatAm from "@/components/PhatAm";
import PhienAm from "@/components/PhienAm";
import { pronunciationOf } from "@/utils/pronunciation";
import {
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "@/interfaces/word";

import { AudioType } from "@/stores/recordingStore";

import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
import { useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";

import Animated, { FadeInUp, LinearTransition } from "react-native-reanimated";
// import {
//   ExpoSpeechRecognitionModule,
//   useSpeechRecognitionEvent,
// } from "expo-speech-recognition";
// import { initWhisper } from "whisper.rn";

import { mediaUrl, useAppStore } from "@/stores/appStore";
import { SenseType } from "../../data";
import AppImage from "@/components/AppImage";
import { SkeletonReact } from "@/components/skeleton/ReactSkeleton";
import { findSenseImage, SenseImage } from "@/services/senseImage";
import { useWordLoading } from "../loadingContext";
import { useWordExists } from "../useWordExists";
import { useWordLangs } from "../wordLang";
import { router } from "expo-router";
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
  
  const [selectedAudio] = useState<
    DocumentPickerAsset | AudioType | null
  >(null);

  const sound = useState<Audio.Sound | null>(null);
  const { settings } = useAppStore();
  const { theme } = useTheme();
  const { lang: wordLang, userLang } = useWordLangs();
  const learning = settings?.learning_language ?? "en";
  const native = settings?.translate_language ?? "vi";
  const translations = useMemo(
    () => getLangTranslate(sense?.contents?.translations, userLang),
    [sense?.contents?.translations, userLang],
  );
  // Bản dịch là từ của ngôn ngữ kia: hỏi 1 lần cái nào đã có ở server (mở ngay), cái nào chưa (chạm vào mới tạo) thì mờ đi, bị từ chối thì gạch ngang
  const translationExists = useWordExists(translations ?? [], userLang);
  // Chạm bản dịch: mở từ đó theo chiều ngược (từ tiếng mẹ đẻ, dịch ra tiếng đang học). Quay về chiều cài đặt thì không cần tham số
  const openTranslation = (word: string) => {
    const back = userLang === learning && wordLang === native;
    router.push({
      pathname: "/screens/Word/Detail/[value]",
      params: { value: word, valueId: word, ...(back ? {} : { lang: userLang, userLang: wordLang }) },
    });
  };

  
  const ipas = useMemo(() => sense?.ipas, [sense?.ipas]);
  
  
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý: chỉ chạy lại khi phụ thuộc liệt kê đổi (hàm / đối tượng còn lại đổi mỗi lần render hoặc đã ổn định)
  }, [sense.image_preview, keywords?.join(","), word]);
  // image_preview là khoá tương đối (images/v1/...): phải ghép media_base_url bằng mediaUrl() mới tải được
  const serverImage = mediaUrl(sense.image_preview);
  const imageUri = serverImage || fallbackImage?.url;
  // Server vẽ ảnh SAU khi từ xong (mọi nghĩa đều được vẽ): chưa có ảnh thì hiện "đang tạo" tối đa 90 giây, quá hạn mới báo chưa có
  const [imageWaitOver, setImageWaitOver] = useState(false);
  useEffect(() => {
    setImageWaitOver(false);
    if (imageUri) return;
    const timer = setTimeout(() => setImageWaitOver(true), 90000);
    return () => clearTimeout(timer);
  }, [sense.id, imageUri]);
  const waitingImage = !imageUri && !isWordLoading && !imageWaitOver;

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
          <PhienAm> {pronunciationOf(ipas, sense?.languageCode)}</PhienAm>
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
                translations.map((item) => {
                  const status = translationExists[item.trim().toLowerCase()]?.status;
                  const pending = status === "unknown";
                  const bad = status === "rejected" || status === "invalid";
                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() => openTranslation(item)}
                      activeOpacity={0.7}
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: bad ? theme.error + "14" : theme.primary + "14", opacity: pending ? 0.55 : 1 }}
                    >
                      <AppText
                        size={"sm"}
                        font="MulishSemiBold"
                        color={bad ? "error" : "primary"}
                        style={bad ? { textDecorationLine: "line-through" } : undefined}
                      >
                        {item}
                      </AppText>
                    </TouchableOpacity>
                  );
                })
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
              ...(imageUri || isWordLoading || waitingImage ? { aspectRatio: 16 / 9 } : { height: 56 }),
              backgroundColor: theme.card,
            }}
            className="rounded-2xl overflow-hidden items-center justify-center"
          >
            {imageUri ? (
              <>
                <AppImage
                  source={{ uri: imageUri }}
                  style={{ width: "100%", height: "100%" }}
                  // Ảnh minh hoạ của server có nền trong suốt, giữ nguyên tỉ lệ; ảnh stock tạm thì phủ kín khung
                  contentFit={serverImage ? "contain" : "cover"}
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
            ) : isWordLoading || waitingImage ? (
              <>
                <SkeletonReact width="100%" height="100%" style={{ borderRadius: 0 }} />
                {waitingImage && (
                  <View className="absolute flex-row items-center gap-2">
                    <AppIcon name="image" branch="feather" size={18} color={theme.subText3} />
                    <AppText size="xs" color="subText3">
                      Đang tạo hình minh hoạ…
                    </AppText>
                  </View>
                )}
              </>
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
