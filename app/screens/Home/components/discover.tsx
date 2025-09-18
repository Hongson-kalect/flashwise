import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import AppCarousel from "@/components/output/carousel";
import { FlipCard } from "@/components/output/flipCard";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { View } from "react-native";
import CardBackSide from "../../Practice/components/backSide";
import CardFrontSide from "../../Practice/components/frontSide";

const Discover = () => {
  const cardHeight = useState(0);
  const { theme } = useTheme();
  const [isFlipped] = useState(false);

  return (
    <>
      <AppTitle title="Discover" />

      <View className="mt-4 flex-row gap-2">
        {["Mistake", "Favorite", "Popular"].map((item, index) => {
          return (
            <View
              key={index}
              style={{
                backgroundColor: index !== 0 ? "#e5e7eb" : theme.primary,
              }}
              className="flex-row items-center px-3 py-1.5 bg-gray-100 rounded-lg"
            >
              <AppText color={index !== 0 ? "subText2" : "white"} size={"sm"}>
                {item}
              </AppText>
            </View>
          );
        })}
      </View>

      <View className="my-8 items-center ">
        <AppCarousel
          mode="horizontal-stack"
          key={"discover-" + cardHeight.toString()}
          height={cardHeight[0] + 40}
          renderItem={() => (
            <View style={{ paddingVertical: 4 }}>
              <FlipCard
                initialFlipped={{ value: isFlipped }}
                BackSide={
                  <CardBackSide
                    question={{}}
                    questionIndex={1}
                    cardHeight={cardHeight}
                  />
                }
                FrontSide={
                  <CardFrontSide
                    question={{}}
                    questionIndex={1}
                    cardHeight={cardHeight}
                  />
                }
              />
            </View>
          )}
        ></AppCarousel>
      </View>
    </>
  );
};

export default Discover;
