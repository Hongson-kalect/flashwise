import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import { reorderArrayWithWeight } from "@/utils/arrayModifier";
import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { QuestionType } from "../example";

type Props = {
  questions: QuestionType[];
  onFinish: () => void;
};
const LastQuestion = ({ questions, onFinish }: Props) => {
  const [type, setType] = useState<"input" | "prompt">("input");
  //   const [question, setQuestion] = useState<string>("");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<"right" | "left" | null>(
    null
  );
  const [wrong, setWrong] = useState<{ right: string; left: string } | null>(
    null
  );
  const [wrongCount, setWrongCount] = useState(0);
  const answerMap = useMemo(() => {
    const qq: { question: number; right: string; left: string }[] = [];

    //Tùy loại có thẻ nối audio, nghĩa, hình ảnh,...
    questions.forEach((item) => {
      qq.push({
        question: item.id,
        right: item.word,
        left: item.translation,
      });
    });

    return qq;
  }, [questions]);
  const [corrected, setCorrected] = useState<number[]>([]);
  const rightSide = useMemo(() => {
    const rights = answerMap.map((item) => ({
      question: item.question,
      value: item.right,
    }));
    return reorderArrayWithWeight(rights);
  }, [questions]);
  const leftSide = useMemo(() => {
    const lefts = answerMap.map((item) => ({
      question: item.question,
      value: item.left,
    }));
    return reorderArrayWithWeight(lefts);
  }, [questions]);

  const handleAnswer = (anser: string, side: "right" | "left") => {
    setSelectedSide(side);
    if (!selectedSide || selectedSide === side) {
      if (selected === anser) {
        setSelectedSide(null);
        setSelected(null);
      } else setSelected(anser);
    } else {
      const question = answerMap.find(
        (item) => item[side] === anser && item[selectedSide] === selected
      );
      if (question) {
        setCorrected((prev) => [...prev, question.question]);
        setSelected(null);
        setSelectedSide(null);
      } else {
        if (side === "right" && selected) {
          setWrong({
            right: anser,
            left: selected,
          });
        }
        if (side === "left" && selected)
          setWrong({
            left: anser,
            right: selected,
          });
        setSelectedSide(null);
        setSelected(null);
        console.log("wrong");
      }
    }
  };

  useEffect(() => {
    corrected.length === questions.length && onFinish();
  }, [corrected]);

  console.log(selectedSide, selected);
  return (
    <View>
      {wrong && (
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 10,
          }}
          onPress={() => setWrong(null)}
        ></Pressable>
      )}
      <View className="p-2 mb-4">
        <AppText font="MulishBlackItalic">Kết nối các từ 2 vế</AppText>
      </View>
      <View className="flex-row gap-2">
        <View className="p-4 w-1/2 gap-8">
          {leftSide.map((item, index) => {
            const seletected =
              selectedSide === "left" && selected === item.value;
            const disabled = corrected.includes(item.question);
            const value = item.value;

            return (
              <SelectItem
                disabled={disabled}
                side="left"
                wrong={wrong?.left === value}
                onPress={() => handleAnswer(value, "left")}
                value={value}
                selected={seletected}
                key={index}
              />
            );
          })}
        </View>
        <View className="p-4 w-1/2 gap-8">
          {rightSide.map((item, index) => {
            const seletected =
              selectedSide === "right" && selected === item.value;
            const disabled = corrected.includes(item.question);
            const value = item.value;

            return (
              <SelectItem
                disabled={disabled}
                side="right"
                wrong={wrong?.right === value}
                onPress={() => handleAnswer(value, "right")}
                value={value}
                selected={seletected}
                key={index}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

type ItemProps = {
  disabled: boolean;
  side: "left" | "right";
  wrong?: boolean;
  onPress: () => void;
  value: string;
  selected: boolean;
};
const SelectItem = (props: ItemProps) => {
  return (
    <AppButton
      disabled={props.disabled}
      //   style={{
      //     backgroundColor: "white",
      //     borderRadius: 8,
      //     elevation: 4,
      //     width: "100%",
      //   }}
      onPress={props.onPress}
      type={
        props.wrong
          ? "error"
          : props.disabled
          ? "success"
          : props.selected
          ? "primary"
          : "white"
      }
    >
      <AppText
        color={
          props.wrong
            ? "white"
            : props.selected
            ? "white"
            : props.disabled
            ? "white"
            : "text"
        }
      >
        {props.value}
      </AppText>
    </AppButton>
  );
};

export default LastQuestion;
