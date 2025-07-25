import { Text, View } from "react-native";

type Props = {
  titles: string[];
  colors?: string[];
};
const AppLabel = ({ titles, colors }: Props) => {
  return (
    <View className="flex-row items-center">
      {titles.map((text, index) => {
        const color = colors ? colors[index % colors.length] : null; // Cycle through colors if fewer colors than titles
        return (
          <Text
            key={index}
            style={{
              color: color || "#000",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            {text}
          </Text>
        );
      })}
    </View>
  );
};

export default AppLabel;
