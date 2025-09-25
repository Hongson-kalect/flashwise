import AppTitle from "@/components/AppTitle";
import CardOption from "@/components/card/CardOption";
import {
  CARD_ELEMENT,
  CardElement,
  cardElementMapping,
  frontCardStyle,
  frontCardTitle,
  qq,
} from "@/configs/cardOptions";
import { useTheme } from "@/providers/Theme";
import { useMemo } from "react";
import {
  ImageBackground,
  StatusBar,
  useWindowDimensions,
  View,
} from "react-native";
import { QuestionType } from "../example";

type Props = {
  cardHeight: [number, React.Dispatch<React.SetStateAction<number>>];
  question: QuestionType;
  questionIndex?: number;
  cardElements: CardElement;
  hideText?: boolean;
};

const CardFrontSide = ({
  hideText = false,
  cardHeight,
  question,
  questionIndex,
  cardElements,
}: Props) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const [word, setWord] = useMemo(
    () => [question.word, question.word],
    [question.word]
  );

  return (
    <View
      onLayout={(e) => {
        e.persist();

        cardHeight[1]((prev) =>
          Math.max(prev, e.nativeEvent?.layout?.height || 0)
        );
      }}
      style={[
        {
          minHeight: ((height - (StatusBar.currentHeight || 0)) / 7) * 4,
          width: width - 48,
          backgroundColor: theme.background,
          elevation: 6,
          height: cardHeight[0] || "auto",
        },
      ]}
      className="rounded-lg"
    >
      <ImageBackground
        borderRadius={8}
        source={require("@/assets/images/card-bg-1.png")}
        style={{
          opacity: 1,
          width: "100%",
          height: "100%",
          zIndex: 0,
          position: "absolute",
        }}
      />
      <View className="mt-4 mb-2">
        <CardOption
          question={question}
          isOptionSound={!!cardElements.frontOptionSound}
        />
      </View>

      {cardElements.frontTitle ? (
        <View className="p-2">
          <AppTitle title={cardElements.frontTitle} />
        </View>
      ) : (
        !cardElements.frontElements.includes("text") && (
          <View className="h-4"></View>
        )
      )}
      {cardElements.frontElements.map((item, index) => {
        let wrapperStyle = undefined;
        let textStyle = undefined;

        if (cardElements.frontStyle?.[item]) {
          wrapperStyle = cardElements.frontStyle[item].wrapper;
          textStyle = cardElements.frontStyle[item].text;
        }
        return (
          <View key={index}>
            {cardElementMapping[item]({
              hideText,
              wrapperStyle,
              textStyle,
              question,
              questionIndex,
            })}
          </View>
        );
      })}

      {/* <CardWord />

      <CardImage />
      <CardDefination />
      <CardExample /> */}
    </View>
  );
};

export default CardFrontSide;
