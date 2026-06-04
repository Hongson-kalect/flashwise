import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";

const step = [
  {
    question: "Trước khi bắt đầu, hãy cùng thiết lập một vài thứ nhé!",
    type: "start",
  },
  {
    question: "Ngôn ngữ bạn cần học là gì nhỉ?",
    type: "learning_language",
  },
  {
    question: "Tiếng mẹ đẻ của bạn là?",
    type: "translate_language",
  },
  {
    question: "Bạn có muốn hiển bản dịch khi học ngôn ngữ?",
    type: "show_translation",
  },
  {
    question: "Chọn một vài chủ đề bạn quan tâm nhé?",
    type: "topic",
  },
  {
    question: "Được rồi, bắt đầu ngay nào!!",
    type: "done",
  },
];

const supportLanguages = [
  { code: "en", language: "English" },
  { code: "hi", language: "Hindi" },
  { code: "es", language: "Spanish" },
  { code: "fr", language: "French" },
  { code: "ja", language: "Japanese" },
  { code: "ru", language: "Russian" },
  { code: "de", language: "German" },
  { code: "it", language: "Italian" },
  { code: "ko", language: "Korean" },
  { code: "pt-BR", language: "Brazilian Portuguese" },
  { code: "ar", language: "Arabic" },
  { code: "tr", language: "Turkish" },
  // { code: "en_US", language: "English (US)" },
  // { code: "en_GB", language: "English (UK)" },
];

const motherLanguages = [
  { code: "en", language: "English" },
  { code: "es", language: "Spanish" },
  { code: "zh", language: "Chinese" },
  { code: "hi", language: "Hindi" },
  { code: "ar", language: "Arabic" },
  { code: "pt", language: "Portuguese" },
  { code: "bn", language: "Bengali" },
  { code: "ru", language: "Russian" },
  { code: "ja", language: "Japanese" },
  { code: "de", language: "German" },
  { code: "fr", language: "French" },
  { code: "it", language: "Italian" },
  { code: "ko", language: "Korean" },
  { code: "vi", language: "Vietnamese" },
  { code: "tr", language: "Turkish" },
  { code: "nl", language: "Dutch" },
  { code: "sv", language: "Swedish" },
  { code: "th", language: "Thai" },
  { code: "pl", language: "Polish" },
  { code: "uk", language: "Ukrainian" },
];

const StartConfigPage = () => {
  const flatListRef = useRef<FlatList>(null);
  const { displayLanguage, dbService, settings, updateSetting } = useAppStore();
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = useMemo(() => step[stepIndex], [stepIndex]);

  const [learningLanguage, setLearningLanguage] = useState(
    settings?.learning_language || "en",
  );
  const confirmLearningLanguage = async (val: string) => {
    await dbService?.setLearningLanguage(val);
  };

  const [translateLanguage, setTranslateLanguage] = useState(() => {
    const support = motherLanguages.find(
      (item) => item.code === displayLanguage,
    );
    if (support) {
      return support.code;
    }

    return "en";
  });
  const confirmTranslateLanguage = async (val: string) => {
    await dbService?.setTranslateLanguage(val);
  };

  const [showTranslation, setShowTranslation] = useState(
    settings?.show_translation || true,
  );
  const confirmShowTranslation = async (val: boolean) => {
    await dbService?.setShowTranslation(val);
  };

  const [searchValue, setSearchValue] = useState("");

  const handleConfirm = async () => {
    if (currentStep.type === "learning_language") {
      await confirmLearningLanguage(learningLanguage);
      updateSetting({ learning_language: learningLanguage });
    } else if (currentStep.type === "translate_language") {
      await confirmTranslateLanguage(translateLanguage);
      updateSetting({ learning_language: learningLanguage });
    } else if (currentStep.type === "show_translation") {
      await confirmShowTranslation(showTranslation);
      updateSetting({ learning_language: learningLanguage });
    }

    stepIndex === step.length - 1
      ? start()
      : setStepIndex(Math.min(step.length - 1, stepIndex + 1));
  };

  const nextable = useMemo(() => {
    if (stepIndex === 1 && !settings?.learning_language) {
      return false;
    }

    if (stepIndex === 2 && !settings?.translate_language) {
      return false;
    }

    if (stepIndex === 3 && settings?.show_translation === undefined) {
      return false;
    }

    return true;
  }, [settings, stepIndex]);

  const { theme } = useTheme();
  const goToTab = (tab: number) => {
    flatListRef.current?.scrollToIndex({
      index: tab,
      animated: true,
    });
  };
  const start = async () => {
    await AsyncStorage.setItem("hasSeenStartPage", "true");
    router.replace("/tabs");
  };

  return (
    <View
      className="flex-1 px-3 justify-between gap-2"
      style={{ backgroundColor: theme.background }}
    >
      <View className="mt-12 flex-1">
        <AppText size={32} font="MulishBold" color="primary">
          Khởi động
        </AppText>
        <View className="flex-row items-center gap-2 mt-8">
          <View className="h-16 w-16 bg-blue-600 rounded-full"></View>
          <Animated.View entering={FadeIn} className={"flex-1"} key={stepIndex}>
            <AppText font="MulishSemiBold" color="primary" size={"lg"}>
              {currentStep.question}
            </AppText>
          </Animated.View>
        </View>

        {stepIndex === 1 && (
          <SelectTargetLanguage
            value={learningLanguage}
            onSelect={(val) => setLearningLanguage(val)}
          />
        )}
        {stepIndex === 2 && (
          <SelectMotherLanguage
            value={translateLanguage}
            onSelect={(val) => setTranslateLanguage(val)}
          />
        )}
        {stepIndex === 3 && (
          <SelectLearningMethod
            value={showTranslation}
            onSelect={(val) => setShowTranslation(val)}
          />
        )}
      </View>
      <View className="flex-row justify-between mb-6 mt-12">
        {stepIndex !== 0 ? (
          <AppButton
            onPress={() => setStepIndex(Math.max(0, stepIndex - 1))}
            title="Prev"
            size="lg"
            type="disabled"
          ></AppButton>
        ) : (
          <View></View>
        )}
        <AppButton
          onPress={handleConfirm}
          size="lg"
          disabled={!nextable}
          type={nextable ? "primary" : "disabled"}
        >
          <AppText color="white" size={"lg"}>
            {stepIndex === step.length - 1 ? "Start" : "Next"}
          </AppText>
          <AppIcon
            name={
              stepIndex === step.length - 1 ? "external-link" : "arrow-right"
            }
            branch="feather"
            size={18}
            color="white"
          />
        </AppButton>
      </View>
    </View>
  );
};

type Props1 = {
  onSelect: (val: string) => void;
  value: string | null;
};
const SelectTargetLanguage = (props: Props1) => {
  const orderedList = useMemo(() => {
    // 1. Clone mảng gốc ra mảng mới để an toàn trong React
    return [...supportLanguages].sort((a, b) => {
      // 2. Ưu tiên hàng đầu: Thằng nào trùng với props.value thì LUÔN LÊN ĐẦU
      if (a.code === props.value) return -1;
      if (b.code === props.value) return 1;

      // 3. Các ngôn ngữ còn lại thì xếp theo bảng chữ cái A -> Z
      return a.language.localeCompare(b.language, "en", {
        sensitivity: "base",
      });
    });
  }, []);
  return (
    <Animated.View entering={SlideInRight} className="flex-1">
      <FlatList
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 24, flex: 1 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
        data={orderedList}
        keyExtractor={(item) => item.code}
        renderItem={({ item, index }) => {
          const isActive = item.code === props.value;
          return (
            <View key={index}>
              <AppButton
                outline={!isActive}
                type={isActive ? "primary" : "disabled"}
                style={{ borderColor: "#00000066" }}
                size="lg"
                onPress={() => props.onSelect(item.code)}
              >
                <AppText
                  color={isActive ? "white" : "text"}
                  font="MulishSemiBold"
                >
                  {item.language}
                </AppText>
              </AppButton>
            </View>
          );
        }}
      />
    </Animated.View>
  );
};
const SelectMotherLanguage = (props: Props1) => {
  const orderedList = useMemo(() => {
    // 1. Clone mảng gốc ra mảng mới để an toàn trong React
    return [...motherLanguages].sort((a, b) => {
      // 2. Ưu tiên hàng đầu: Thằng nào trùng với props.value thì LUÔN LÊN ĐẦU
      if (a.code === props.value) return -1;
      if (b.code === props.value) return 1;

      // 3. Các ngôn ngữ còn lại thì xếp theo bảng chữ cái A -> Z
      return a.language.localeCompare(b.language, "en", {
        sensitivity: "base",
      });
    });
  }, []);

  return (
    <Animated.View entering={SlideInRight} className="flex-1">
      <FlatList
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 24, flex: 1 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
        data={orderedList}
        keyExtractor={(item) => item.code}
        renderItem={({ item, index }) => {
          const isActive = item.code === props.value;
          return (
            <View key={index}>
              <AppButton
                outline={!isActive}
                type={isActive ? "primary" : "disabled"}
                style={{ borderColor: "#00000066" }}
                size="lg"
                onPress={() => props.onSelect(item.code)}
              >
                <AppText
                  color={isActive ? "white" : "text"}
                  font="MulishSemiBold"
                >
                  {item.language}
                </AppText>
              </AppButton>
            </View>
          );
        }}
      />
    </Animated.View>
  );
};

const learningMethod = [
  {
    value: true, // target -> target
  },
  {
    value: false, // target -> mother
  },
];

type LearningMethodProps = {
  onSelect: (bol: boolean) => void;
  value: boolean | undefined;
};
const SelectLearningMethod = (props: LearningMethodProps) => {
  return (
    <Animated.View entering={SlideInRight} className="flex-1">
      <FlatList
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 24, flex: 1 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
        data={learningMethod}
        keyExtractor={(item) => item.value.toString()}
        renderItem={({ item, index }) => {
          const isActive = item.value === props.value;
          return (
            <View key={index}>
              <AppButton
                outline={!isActive}
                style={{ borderColor: "#00000066" }}
                size="lg"
                onPress={() => props.onSelect(item.value)}
              >
                <AppText
                  color={isActive ? "white" : "text"}
                  font="MulishSemiBold"
                >
                  {item.value ? "Yes" : "No"}
                </AppText>
              </AppButton>
            </View>
          );
        }}
      />
    </Animated.View>
  );
};

export default StartConfigPage;
