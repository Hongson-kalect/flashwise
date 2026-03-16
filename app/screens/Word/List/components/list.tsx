import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import CardListItem from "./listItem";

const WordList = () => {
  const { theme } = useTheme();
  return (
    <View>
      <View
        style={{ backgroundColor: theme.background }}
        className="rounded-b-lg gap-6"
      >
        {Array.from({ length: 100 }).map((_, index) => (
          <View key={index}>
            <CardListItem />
          </View>
        ))}
      </View>
    </View>
  );
};

export default WordList;
