import AppTitle from "@/components/AppTitle";
import CardOption from "@/components/card/CardOption";
import {
  backCardInfo,
  backCardTitle,
  CardElement,
  cardElementMapping,
  backCardStyle,
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

type Props = {
  cardHeight: [number, React.Dispatch<React.SetStateAction<number>>];
  question: any;
  cardElements: CardElement;
  questionIndex?: number;
};
const CardBackSide = ({
  cardHeight,
  question,
  questionIndex,
  cardElements,
}: Props) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();

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
        source={require("@/assets/images/card-bg-2.png")}
        style={{
          width: "100%",
          height: "100%",
          zIndex: 0,
          position: "absolute",
        }}
      />
      <View className="mt-4 mb-2">
        <CardOption isOptionSound={!!cardElements.backOptionSound} />
      </View>

      {cardElements.backTitle ? (
        <View className="p-2">
          <AppTitle title={cardElements.backTitle} />
        </View>
      ) : (
        !cardElements.backElements.includes("text") && (
          <View className="h-4"></View>
        )
      )}
      {cardElements.backElements.map((item, index) => {
        let wrapperStyle = undefined;
        let textStyle = undefined;

        if (cardElements.backStyle?.[item]) {
          wrapperStyle = cardElements.backStyle[item].wrapper;
          textStyle = cardElements.backStyle[item].text;
        }
        return (
          <View key={index}>
            {cardElementMapping[item]({
              wrapperStyle,
              textStyle,
              question,
              questionIndex,
            })}
          </View>
        );
      })}
    </View>
  );
};

export default CardBackSide;
