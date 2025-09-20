import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { FlipCard } from "@/components/output/flipCard";
import { useTheme } from "@/providers/Theme";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
// import FlipCard from "react-native-flip-card";
import AppButton from "@/components/AppButton";
import CardTextInput from "@/components/card/ansers/TextInput";
import { CardElement } from "@/configs/cardOptions";
import useModalStore from "@/stores/modalStore";
import { reorderArrayWithWeight } from "@/utils/arrayModifier";
import { makeQuestion } from "@/utils/makeQuestion";
import { router } from "expo-router";
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

export default function PracticePage() {
  const [questions, setQuestions] = useState([1, 2, 3, 4, 5]);
  const { theme } = useTheme();
  // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [finalQuestion, setFinalQuestion] = useState(false);
  const [completed, setCompleted] = useState(false);
  const shuffleNumber = useRef(questions.length - 1);
  const [questionOrder, setQuestionOrder] = useState([...questions]);
  const [method] = useState([
    "write",
    "listen",
    "write",
    "speak",
    "chooseWord",
  ]);
  const [questionState, setQuestionState] = useState(() => {
    const state: { [key: number]: string[] } = {};
    questions.forEach((question, index) => {
      state[question] = [];
    });
    return state;
  });

  const [questionElements, setQuestionElements] = useState<CardElement>({
    frontElements: [],
    backElements: [],
    answerMethod: "write",
  });

  const getQuestion = (id: number) => {
    //Kiểm tra tất cả câu hỏi đã hoàn thành hay chưa
    if (
      Object.entries(questionState).some(
        ([key, value]) => value.length < method.length
      )
    ) {
      if (questionState[id].length < method.length) {
        const currentMethod = method[questionState[id].length];

        // Dựa vào currentMethod và question để tạo cấu hỏi. Tạm dùng ID
        const question = makeQuestion(currentMethod, id);
        setQuestionElements(question);
        const newOrder = reorderArrayWithWeight(
          questionOrder,
          shuffleNumber.current
        );
        shuffleNumber.current -= 1;
        if (shuffleNumber.current === 0) {
          shuffleNumber.current = questions.length - 1;
        }

        setQuestionOrder(newOrder);
        //Nếu câu hỏi hiện tại đã đủ thì chuyển sang cấu hỏi khác
      } else {
        let newOrder = [...questionOrder];

        while (questionState[newOrder[0]].length >= method.length) {
          newOrder = reorderArrayWithWeight(newOrder, shuffleNumber.current);
          shuffleNumber.current -= 1;
          if (shuffleNumber.current === 0) {
            shuffleNumber.current = questions.length - 1;
          }
        }

        setQuestionOrder(newOrder); // chỉ set 1 lần sau cùng
        return getQuestion(newOrder[0]); // hoặc gọi callback gì đó nếu cần
      }
    } else setFinalQuestion(true);
  };

  useEffect(() => {
    getQuestion(questionOrder[0]);
  }, []);

  const question = useMemo(
    () => questions[questionOrder[0]],
    [questionOrder[0]]
  );
  const [questionType, setQuestionType] = useState("");
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
    resetCardState();

    //Có 1 hàm để lấy kiểu của câu hỏi. Dựa vào cấp của từ, vòng lặp hiện tại. Điều kiện hiện tại của người dùng
    const newOrder = reorderArrayWithWeight(
      questionOrder,
      shuffleNumber.current--
    );
    if (shuffleNumber.current === 0) {
      shuffleNumber.current = questions.length - 1;
    }
    getQuestion(newOrder[0]); // Chuyển sang cấu hỏi khác();
  };

  const Finish = () => {
    alert("Mọe m chứ xong rồi");
    setTimeout(() => {
      router.back();
      //Chuyển sang bài nối từ => Hiển thị thông báo hoàn tất => Tiếp tục luyện tập | Từ mới | Về Home
    }, 3000);
  };

  const resetCardState = () => {
    isFlipped.value = false;
    setIsCorrect(null);
    setFailedOnce(false);
    cardHeight[1](0);
  };

  // Khi đổi câu hỏi or có cái vẹo gì đó
  // useEffect(() => {
  //   resetCardHeight();
  // }, []);

  const handleLeaning = () => {
    resetCardState();
    const newQuestions = [1, 2, 3, 4, 5];
    const newQuestionState: { [key: number]: string[] } = {};
    newQuestions.map((question, index) => {
      newQuestionState[question] = [];
    });
    setQuestions(newQuestions);
    setQuestionOrder(newQuestions);
    shuffleNumber.current = newQuestions.length - 1;
    setFinalQuestion(false);
    setCompleted(false);
    setQuestionState(newQuestionState);

    // api gọi câu hỏi mới
  };

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
                setIsCorrect(null);
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
        key={question}
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
              {finalQuestion ? (
                <View>
                  <AppText>Chỗ này là cho nối từ này</AppText>
                  <View className="flex-row gap-2 items-center justify-center">
                    <AppButton
                      onPress={() => {
                        handleLeaning();
                      }}
                    >
                      <AppText>Hoàn thành câu cuối</AppText>
                    </AppButton>
                    <AppButton
                      onPress={() => {
                        handleLeaning();
                      }}
                      type="success"
                    >
                      <AppText>Học tiếp</AppText>
                    </AppButton>
                    <AppButton type="primary" onPress={() => router.back()}>
                      <AppText>Quay lại</AppText>
                    </AppButton>
                  </View>
                </View>
              ) : (
                <FlipCard
                  disabled={false}
                  duration={500}
                  FrontSide={
                    <CardFrontSide
                      question={question}
                      cardHeight={cardHeight}
                      cardElements={questionElements}
                    />
                  }
                  BackSide={
                    <CardBackSide
                      question={question}
                      cardHeight={cardHeight}
                      cardElements={questionElements}
                    />
                  }
                />
              )}
              {/* <TestFlipCard /> */}
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
          key={"anser-" + question} //question.id
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
