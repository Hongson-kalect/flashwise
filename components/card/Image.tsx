import { QuestionType } from "@/app/screens/Practice/example";
import { useState } from "react";
import { Image, TextStyle, View, ViewStyle } from "react-native";

type Props = {
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
  question: QuestionType;
};

const CardImage = (props: Props) => {
  const [imageHeight, setImageHeight] = useState(0);

  const renderImageHeight = (width: number) => {
    if (width) {
      setImageHeight((prev) => Math.max(prev, (width / 16) * 9));
    }
  };
  return (
    <View
      onLayout={(e) => renderImageHeight(e.nativeEvent.layout.width)}
      className="w-full items-center justify-center"
    >
      <View style={{ height: imageHeight || 180, width: "100%" }}>
        <Image
          className="w-full h-full"
          source={{ uri: props.question.image }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

export default CardImage;
