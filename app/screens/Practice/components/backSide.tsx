import AppTitle from "@/components/AppTitle";
import CardOption from "@/components/card/CardOption";
import {
  backCardInfo,
  cardElementMapping,
  frontCardStyle,
  frontCardTitle,
  qq,
} from "@/configs/cardOptions";
import { useTheme } from "@/providers/Theme";
import { useMemo } from "react";
import { StatusBar, useWindowDimensions, View } from "react-native";

type Props = {
  cardHeight: [number, React.Dispatch<React.SetStateAction<number>>];
  question: any;
  type: keyof typeof qq;
  questionIndex?: number;
};
const CardBackSide = ({ cardHeight, question, questionIndex, type }: Props) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const cardTitle = useMemo(() => {
    return frontCardTitle[type];
  }, [type]);

  const [isOptionSound, frontCardType, moreStyle] = useMemo(() => {
    const options = qq[type];
    const backType = options.backside?.[0];
    const elements = backCardInfo[backType];

    const headerSound = elements.includes("option_sound");
    const newType = elements.filter((item) => item !== "option_sound");

    const moreStyle = frontCardStyle[type];
    return [headerSound, newType, moreStyle];
  }, [type]);

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
      <View className="mt-4 mb-2">
        <CardOption isOptionSound={isOptionSound} />
      </View>

      {cardTitle ? (
        <View className="p-2">
          <AppTitle title={cardTitle} />
        </View>
      ) : (
        !frontCardType.includes("text") && <View className="h-4"></View>
      )}
      {frontCardType.map((item, index) => {
        let wrapperStyle = undefined;
        let textStyle = undefined;

        if (moreStyle?.[item]) {
          wrapperStyle = moreStyle[item].wrapper;
          textStyle = moreStyle[item].text;
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
