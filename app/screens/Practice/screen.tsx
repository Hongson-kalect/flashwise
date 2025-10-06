import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { FlipCard } from "@/components/output/flipCard";
import { useTheme } from "@/providers/Theme";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DimensionValue,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
// import FlipCard from "react-native-flip-card";
import CardTextInput from "@/components/card/ansers/TextInput";
import { CardElement } from "@/configs/cardOptions";
import useModalStore from "@/stores/modalStore";
import useUserStateStore from "@/stores/userStateStore";
import { reorderArrayWithWeight } from "@/utils/arrayModifier";
import { makeQuestion } from "@/utils/makeQuestion";
import { router } from "expo-router";
import { Divider } from "react-native-paper";
import {
  default as Animated,
  FadeOut,
  LinearTransition,
  default as ReAnimated,
  SlideInDown,
  SlideInRight,
  SlideInUp,
  SlideOutLeft,
  useSharedValue,
} from "react-native-reanimated";
import CardBackSide from "./components/backSide";
import CardFrontSide from "./components/frontSide";
import LastQuestion from "./components/lastQuestion";
import { QuestionType, testData } from "./example";

export default function PracticePage() {
  const [questions, setQuestions] = useState(testData);
  const { theme } = useTheme();
  // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [finalQuestion, setFinalQuestion] = useState(false);
  const [completed, setCompleted] = useState(false);
  const shuffleNumber = useRef(questions.length - 1);
  const [questionOrder, setQuestionOrder] = useState<number[]>(() =>
    questions.map((question) => question.id)
  );
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(questions[0].id);
  const [method] = useState<("write" | "speak" | "listen" | "question")[]>([
    "write",
    "listen",
  ]);
  const { hearable, talkable } = useUserStateStore();
  const [currentMethod, setCurrentMethod] = useState(method[0]);
  const [questionState, setQuestionState] = useState(() => {
    const state: { [key: number]: string[] } = {};
    questions.forEach((question, index) => {
      state[question.id] = [];
    });
    return state;
  });
  const [question, setQuestion] = useState(questions[0]);

  const [questionElements, setQuestionElements] = useState<CardElement>({
    answer: "qq",
    frontElements: [],
    backElements: [],
    answerMethod: "write",
  });
  const [flipable, setFlippable] = useState(false);
  const [flipCountdown, setFlipCountdown] = useState(-1);
  const intervalRef = useRef<NodeJS.Timeout | number>(null);
  const [autoFlip, setAutoFlip] = useState({
    value: false,
    version: 1,
  });
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    if (questionElements.flipType === "manual") {
      setFlippable(true);
    } else if (questionElements.flipType === "answer" && isAnswered) {
      setFlippable(true);
    } else if (questionElements.flipType === "answerAuto" && isAnswered) {
      setFlippable(true);
      setAutoFlip((prev) => ({
        value: true,
        version: prev.version + 1,
      }));
    } else if (
      typeof questionElements.flipType === "number" &&
      questionElements.flipType > 0
    ) {
      setFlipCountdown(questionElements.flipType);
    }
  }, [questionElements, isAnswered]);

  useEffect(() => {
    if (flipCountdown > 0) {
      intervalRef.current = setInterval(() => {
        setFlipCountdown((prev) => {
          if (prev <= 1) {
            setFlippable(true);
            intervalRef.current && clearInterval(intervalRef.current);
            return -1;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [flipCountdown]);

  useEffect(() => {
    if (!talkable && !hearable) return;
    getQuestion(false); // Lấy câu hỏi và ko làm xáo trộn thứ tự
  }, [talkable, hearable]);

  const getQuestion = (reOrderQuestion: boolean = true) => {
    resetCardState();

    //Kiểm tra tất cả câu hỏi đã hoàn thành hay chưa
    if (
      Object.entries(questionState).some(
        ([key, value]) => value.length < method.length
      )
    ) {
      // let newOrder = reOrderQuestion
      //   ? [...questionOrder.slice(1), questionOrder[0]]
      //   : questionOrder;

      let newOrder = questionOrder;
      let newCompletedQuestion = completedQuestions;

      // Nếu thay đổi order thì nó mới thay order, Chỉ có lúc mới ko đổi order vào nên auto hợp lệ
      if (reOrderQuestion) {
        // Lặp đến khi tìm được câu hợp lệ
        do {
          // Khi còn duy nhất 1 câu.
          // if (newOrder.length === 1) {
          //   break;
          // }

          // Đẩy câu hỏi trước đó (Vừa trả lời) về cuối và sắp xếp ngẫu nhiên 1 vài câu
          newOrder = [...newOrder.slice(1), newOrder[0]];
          newOrder = reorderArrayWithWeight(newOrder, shuffleNumber.current);

          // Nếu câu hỏi đầu tiên sau khi sếp đã trả lời hết, loại bỏ nó và thêm vào mảng hoàn tất
          if (questionState[newOrder[0]].length >= method.length) {
            newCompletedQuestion = [...newCompletedQuestion, newOrder[0]];
            newOrder = newOrder.slice(1);
            shuffleNumber.current = newOrder.length;
          } else {
            shuffleNumber.current -= 1;
            if (shuffleNumber.current === 0) {
              shuffleNumber.current = questions.length - 1;
            }
          }
        } while (questionState[newOrder[0]].length >= method.length);
      }

      // có order Hợp lệ
      setQuestionOrder(newOrder); // chỉ set 1 lần sau cùng

      const questionId = newOrder[0];
      const currentMethod = method[questionState[questionId].length];
      const wordInfo = questions.find((q) => q.id === questionId);
      const question = makeQuestion(currentMethod, wordInfo!);
      const questionInfo = questions.find((q) => q.id === newOrder[0]);
      setCurrentQuestionId(newOrder[0]);
      questionInfo && setQuestion(questionInfo);
      setQuestionElements(question);
      setCurrentMethod(currentMethod);
      // return getQuestion(newOrder[0]); // hoặc gọi callback gì đó nếu cần
    } else setFinalQuestion(true);
  };

  const [questionType, setQuestionType] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [failedOnce, setFailedOnce] = useState(false);

  const cardHeight = useState(0);
  const isFlipped = useSharedValue(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [modalInput, setModalInput] = useState(true);
  const questionsLength = useMemo(
    () => questions.length * method.length + 1,
    [questions, method]
  );
  const progressWidth = useMemo(() => {
    let currentLength = 0;
    Object.entries(questionState).forEach(([key, value]) => {
      currentLength += value.length;
    });
    return (Math.floor((currentLength / questionsLength) * 100) +
      "%") as DimensionValue;
  }, [questionState]);

  const onAnswer = async (anser: string) => {
    await checkResult(anser);
  };

  const checkResult = async (anser: string) => {
    // Kiểm tra và hiển thị kết quả hoặc yêu cầu nhập lại

    if (
      anser.toLocaleLowerCase() === questionElements.answer.toLocaleLowerCase()
    ) {
      setIsCorrect(true);
      setFailedOnce(false);
      setIsAnswered(true);
      const newState = [...questionState[currentQuestionId], currentMethod];
      setQuestionState((prev) => ({
        ...prev,
        [currentQuestionId]: newState,
      }));
    } else {
      if (!failedOnce) {
        // Cho phép sai 1 lần
        setFailedOnce(true);
        // setTimeout(() => {
        //   setIsCorrect(null);
        // }, 1000);
      } else {
        setIsAnswered(true);
        setIsCorrect(false);
        const newState = questionState[currentQuestionId].slice(0, -1);
        setQuestionState((prev) => ({
          ...prev,
          [currentQuestionId]: newState,
        }));
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
    // const newOrder = reorderArrayWithWeight(
    //   questionOrder,
    //   shuffleNumber.current--
    // );
    // if (shuffleNumber.current === 0) {
    //   shuffleNumber.current = questions.length - 1;
    // }
    getQuestion(); // Chuyển sang cấu hỏi khác();
  };

  // const {setGlobalModal} =useModalStore()

  const Finish = () => {
    // Gọi api gửi đã hoàn tất luyện tập với ids
    setGlobalModal({
      type: "confirm",
      modalTitle: "Hoàn tất",
      message: "Bạn có muốn tiếp tục luyện tập?",
      okText: "Tiếp",
      cancelText: "Không",
      onOk: handleContinue,
      onCancel: router.back,
    });
    // setTimeout(() => {
    //   router.back();
    // }, 3000);
  };

  const resetCardState = () => {
    isFlipped.value = false;
    setFlippable(false);
    setFlipCountdown(-1);
    setAutoFlip({ value: false, version: 0 });
    setIsAnswered(false);
    setIsCorrect(null);
    setFailedOnce(false);
    cardHeight[1](0);
  };

  // Khi đổi câu hỏi or có cái vẹo gì đó
  // useEffect(() => {
  //   resetCardHeight();
  // }, []);

  const handleContinue = () => {
    resetCardState();
    const newQuestions = [...testData];
    initQuestionState(newQuestions);
    setQuestions(newQuestions);

    // api gọi câu hỏi mới
  };

  const initQuestionState = (questions: QuestionType[]) => {
    setQuestionOrder(questions.map((question) => question.id));
    const newQuestionState: { [key: number]: string[] } = {};
    questions.map((question, index) => {
      newQuestionState[question.id] = [];
    });

    shuffleNumber.current = questions.length - 1;
    setFinalQuestion(false);
    setCompleted(false);
    setCompletedQuestions([]);
    setQuestionState(newQuestionState);
  };

  useEffect(() => {
    getQuestion(false);
  }, [questions]);

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

  useEffect(() => {
    if (isCorrect) {
      setTimeout(() => {
        getQuestion();
      }, 500);
    }
  }, [questionState]);

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
          <View
            className="h-5 bg-gray-200 rounded-full overflow-hidden"
            style={{ flex: 1 }}
          >
            <ReAnimated.View
              layout={LinearTransition.springify().mass(0.1)}
              className="h-full rounded-full"
              style={{
                width: progressWidth,
                elevation: 4,
                backgroundColor: theme.success,
              }}
            ></ReAnimated.View>
          </View>

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
        key={currentQuestionId + "-" + hearable + "-" + talkable}
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
              <View className="flex-row gap-2">
                {/* <AppButton onPress={() => checkResult(questionElements.answer)}>
                  <AppText color="white">True {currentQuestionId}</AppText>
                </AppButton>
                <AppButton
                  onPress={() =>
                    checkResult(questionElements.answer + "-error")
                  }
                  type="error"
                >
                  <AppText color="white">False {currentQuestionId}</AppText>
                </AppButton> */}
              </View>
              {finalQuestion ? (
                <View>
                  {/* <AppText></AppText> */}
                  <View>
                    <LastQuestion questions={questions} onFinish={Finish} />
                  </View>
                  {/* <View className="gap-2 items-center justify-center">
                    <AppButton
                      onPress={() => {
                        handleLeaning();
                      }}
                    >
                      <AppText color="white">Trả lời</AppText>
                    </AppButton>
                    <AppButton
                      onPress={() => {
                        handleLeaning();
                      }}
                      type="success"
                    >
                      <AppText color="white">Học tiếp</AppText>
                    </AppButton>
                    <AppButton type="primary" onPress={() => router.back()}>
                      <AppText color="white">Quay lại</AppText>
                    </AppButton>
                  </View> */}
                </View>
              ) : (
                <FlipCard
                  initialFlipped={autoFlip}
                  disabled={!flipable}
                  duration={500}
                  FrontSide={
                    <CardFrontSide
                      hideText={!isAnswered}
                      question={question}
                      cardHeight={cardHeight}
                      cardElements={questionElements}
                    />
                  }
                  BackSide={
                    <CardBackSide
                      hideText={!isAnswered}
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
