import { Image, TextStyle, View, ViewStyle } from "react-native";

type Props = {
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
};

const CardImage = (props: Props) => {
  return (
    <View className="w-full" style={{ height: 180 }}>
      <Image
        className="w-full h-full"
        source={{ uri: "https://picsum.photos/200/300" }}
        resizeMode="cover"
      />
    </View>
  );
};

export default CardImage;
