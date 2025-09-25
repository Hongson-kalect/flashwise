import { QuestionType } from "@/app/screens/Practice/example";
import { useState } from "react";
import { Image, TextStyle, View, ViewStyle } from "react-native";

type Props = {
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
  question: QuestionType;
};

const CardImage = (props: Props) => {
  const [imageWidth, setImageWidth] = useState(0);

  const renderImageWidth = (width: number) => {
    if (width) {
      setImageWidth((prev) => Math.max(prev, (width / 16) * 9));
    }
  };
  return (
    <View
      onLayout={(e) => renderImageWidth(e.nativeEvent.layout.width)}
      className="w-full items-center justify-center"
    >
      <View style={{ height: imageWidth || 180, width: "100%" }}>
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
