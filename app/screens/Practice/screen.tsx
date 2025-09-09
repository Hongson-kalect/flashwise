import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { FlipCard } from "@/components/output/flipCard";
import { useTheme } from "@/providers/Theme";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
// import FlipCard from "react-native-flip-card";
import CardTextInput from "@/components/card/ansers/TextInput";
import useModalStore from "@/stores/modalStore";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Divider } from "react-native-paper";
import {
  default as Animated,
  default as ReAnimated,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
} from "react-native-reanimated";
import CardBackSide from "./components/backSide";
import CardFrontSide from "./components/frontSide";

const cc = [
  "Học từ mới: Hiện full, trừ nghĩa, người dùng bấm vào để hiển thị nghĩa (Đoán nghĩa), sau đó gõ lại nội dung gốc",
  "Lượt 2: Hiện full, trừ từ gốc, người dùng gõ từ gốc",
  "Lượt 3: Phát âm thanh, người dùng gõ từ",
  "Lượt 4: Hiện mic, người dùng phát âm từ",
  "Lượt 5: Lặp lại lượt 2, không hiện bản dịch",
];

const other = [
  "Nhìn hình đoán từ: (Chỉ áp dụng cho từ có hình) Hiển thị hình và gõ từ hoặc chọn abcd",
  "Hiện bản dịch: Chọn or nhập or đọc từ gốc",
  "Điền từ vào chỗ trống trong ví dụ",
  "Nối từ và nghĩa, nếu có full ảnh thì nối từ với ảnh",
  "Cắt các từ trong câu và chọn như doulingo",

  "Siêu tốc: hiển thị từ gốc, chọn bản dịch. Hiện bản dịch, chọn từ gốc... Túm lại là lặp đi lặp lại 1 phương pháp, trừ nghe",
  "Câu hỏi đố với từ đó, dạng abcd, các dạng như bài tiếng anh cơ bản: Chọn từ sai trong câu, dạng đúng của từ, trọng âm, sắp xếp thứ tự từ",
];

const methods = {
  newWord: {
    1: "Hiển thị từ, nghĩa, ví dụ theo ngôn ngữ dựa vào cài đặt của người dùng",
    2: "Hiển thị từ và chỉ cần nhấn next?",
  },
  input: {
    // Thứ chương trình đưa ra cho người dùng
    1: "Hiển thị từ gốc, nghĩa, hình ảnh, định nghĩa, ví dụ",
    2: "Hiển thị hình ảnh, định nghĩa, ví dụ (lược bỏ từ gốc)",
    3: "Hiển thị hình ảnh | Định nghĩa",
    4: "Hiển thị từ gốc",
    5: "Hiển thị bản dịch của từ đó",
    6: "Phát âm thanh phát âm của từ đó",
    7: "Phát âm thanh định nghĩa của từ đó",
    8: "Hiển thị hình cái mic và từ gốc",
  },
  output: {
    // cách người dùng cần làm để trả lời
    1: {
      1: "Viết lại từ đó",
    },
    2: {
      1: "Viết lại từ đó",
      2: "Chọn hình ảnh",
      3: "Chọn từ đúng",
    },
    3: {
      1: "Viết lại từ đó",
      2: "Chọn hình ảnh",
      3: "Chọn từ đúng",
    },
    4: {
      1: "Chọn bản dịch",
      2: "Phát âm từ",
    },
    5: {
      1: "Chọn từ gốc",
      2: "Ghi lại từ gốc",
    },
  },
};
const questions = [1, 2, 3, 4, 5];
export default function PracticePage() {
  const { theme } = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const question = useMemo(
    () => questions[currentQuestionIndex],
    [currentQuestionIndex]
  );

  const cardHeight = useState(0);
  const isFlipped = useSharedValue(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [modalInput, setModalInput] = useState(true);

  const onAnswer = async (anser: string) => {
    await checkResult(anser);
  };

  const checkResult = async (anser: string) => {
    console.log(anser);

    // Kiểm tra và hiển thị kết quả hoặc yêu cầu nhập lại

    if (anser === "a")
      setTimeout(() => {
        if (currentQuestionIndex >= questions.length - 1) {
          Finish();
        } else {
          nextQuestion();
        }
      }, 2000);
    else alert("sai em ây");
  };

  const nextQuestion = () => {
    isFlipped.value = false;
    resetCardHeight();
    setCurrentQuestionIndex(currentQuestionIndex + 1);
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
              onPress={() => setCurrentQuestionIndex(0)}
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
        key={currentQuestionIndex}
        entering={SlideInRight}
        exiting={SlideOutLeft}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-end",
          }}
          enableOnAndroid={true}
          extraScrollHeight={140} // Đẩy thêm để không bị che
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-2">
            <View className="items-center mt-6">
              {/* <TestFlipCard /> */}
              <FlipCard
                disabled={false}
                duration={500}
                isFlipped={isFlipped}
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
            <View
              // style={{ marginTop: cardHeight + 28 }}
              className=" mt-8 px-4 mb-6"
            >
              <AppText
                className="mb-2"
                size={"sm"}
                font="MulishSemiBold"
                color="error"
              >
                Từ của cái của nợ thẻ này là?
              </AppText>

              <CardTextInput onAnser={onAnswer} />
              {/* <WordSelect onAnser={onAnswer} /> */}
            </View>

            <View className="h-8"></View>
          </View>
        </KeyboardAwareScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({});
