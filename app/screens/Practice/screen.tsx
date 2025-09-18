import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { FlipCard } from "@/components/output/flipCard";
import { useTheme } from "@/providers/Theme";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
// import FlipCard from "react-native-flip-card";
import CardTextInput from "@/components/card/ansers/TextInput";
import useModalStore from "@/stores/modalStore";
import { Divider } from "react-native-paper";
import {
  default as Animated,
  FadeOut,
  default as ReAnimated,
  SlideInDown,
  SlideInRight,
  SlideInUp,
  SlideOutLeft,
  useSharedValue,
} from "react-native-reanimated";
import CardBackSide from "./components/backSide";
import CardFrontSide from "./components/frontSide";

const questions = [1, 2, 3, 4, 5];
export default function PracticePage() {
  const { theme } = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const question = useMemo(
    () => questions[currentQuestionIndex],
    [currentQuestionIndex]
  );
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [failedOnce, setFailedOnce] = useState(false);

  const cardHeight = useState(0);
  const isFlipped = useSharedValue(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [modalInput, setModalInput] = useState(true);

  const onAnswer = async (anser: string) => {
    await checkResult(anser);
  };

  const checkResult = async (anser: string) => {
    // Kiểm tra và hiển thị kết quả hoặc yêu cầu nhập lại

    if (anser === "A") {
      setIsCorrect(true);
      setFailedOnce(false);
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    } else {
      if (!failedOnce) {
        // Cho phép sai 1 lần
        setFailedOnce(true);
        // setTimeout(() => {
        //   setIsCorrect(null);
        // }, 1000);
      } else {
        setIsCorrect(false);
        // Chuyển câu hoặc kết thúc nếu sai lần 2
        // Hoặc thêm câu hỏi cho nhớ, hoặc giảm gì gì đó
        // setTimeout(() => {
        //   if (currentQuestionIndex >= questions.length - 1) {
        //     Finish();
        //   } else {
        //     nextQuestion();
        //   }
        // }, 1000);
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex >= questions.length - 1) {
      Finish();
    } else {
      isFlipped.value = false;
      setIsCorrect(null);
      setFailedOnce(false);
      resetCardHeight();
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const Finish = () => {
    alert("Mọe m chứ xong rồi");
  };

  const resetCardHeight = () => {
    cardHeight[1](0);
  };

  // Khi đổi câu hỏi or có cái vẹo gì đó
  // useEffect(() => {
  //   resetCardHeight();
  // }, []);

  const { setGlobalModal } = useModalStore();
  const handleInputResult = () => {
    setGlobalModal({
      type: "input",
      message: "Từ của cái của nợ này là?",
      inAnimation: "slideInDown",
      isShowCancelButton: false,
    });
  };

  useEffect(() => {
    if (isFlipping) {
      setIsFlipping(false);
    }
  }, [isFlipping]);

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: theme.background,
      }}
    >
      <View className="px-2">
        <View className="h-10 flex-row items-center gap-4 mb-2">
          <View
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.success }}
          >
            <View className="h-6 w-6 rounded-full bg-white"></View>
          </View>
          <ReAnimated.View
            className="h-5 bg-gray-200 rounded-full"
            style={{ flex: 1 }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: "50%",
                elevation: 4,
                backgroundColor: theme.success,
              }}
            ></View>
          </ReAnimated.View>

          <View>
            <AppIcon
              onPress={() => {
                setCurrentQuestionIndex(0);
                setIsCorrect(null);
                resetCardHeight();
              }}
              branch="antd"
              name={"setting"}
              size={28}
              color="subText2"
            />
          </View>
        </View>

        <Divider />
      </View>
      <Animated.View
        className="flex-1 justify-between"
        key={currentQuestionIndex}
        entering={SlideInRight}
        exiting={SlideOutLeft}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-end",
          }}
          // enableOnAndroid={true}
          // extraScrollHeight={140} // Đẩy thêm để không bị che
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-2">
            <View className="items-center mt-6">
              {/* <TestFlipCard /> */}
              <FlipCard
                disabled={false}
                duration={500}
                FrontSide={
                  <CardFrontSide
                    questionIndex={currentQuestionIndex}
                    question={question}
                    cardHeight={cardHeight}
                  />
                }
                BackSide={
                  <CardBackSide
                    questionIndex={currentQuestionIndex}
                    question={question}
                    cardHeight={cardHeight}
                  />
                }
              />
            </View>

            <View className="h-8"></View>
          </View>
        </ScrollView>
        <View
          // style={{ marginTop: cardHeight + 28 }}
          className="bg-red-400"
        >
          <CardTextInput onAnser={onAnswer} />
          {/* <WordSelect onAnser={onAnswer} /> */}
        </View>
      </Animated.View>

      {isCorrect === true && (
        <Animated.View
          className={"absolute bottom-0 right-0 left-0 h-28"}
          style={{ backgroundColor: theme.success }}
          entering={SlideInDown}
          exiting={SlideOutLeft}
        >
          <View>
            <AppText color="white">Đúng roài em ây</AppText>
          </View>
        </Animated.View>
      )}
      {isCorrect === false && (
        <Animated.View
          key={"anser-" + currentQuestionIndex}
          className={"absolute bottom-0 right-0 left-0 h-28"}
          style={{ backgroundColor: theme.error }}
          entering={SlideInDown}
          exiting={SlideOutLeft}
        >
          <TouchableOpacity
            className="h-full w-full"
            onPress={() => nextQuestion()}
          >
            <View>
              <AppText color="white">Sai em ây</AppText>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {failedOnce ? (
        <Animated.View
          className={"absolute top-0 left-1/2  items-center justify-center"}
          entering={SlideInUp}
          exiting={FadeOut}
        >
          <View
            style={{ backgroundColor: theme.error }}
            className="px-4 py-2 rounded-full -translate-x-1/2"
          >
            <AppText color="white">1 nhát</AppText>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({});
