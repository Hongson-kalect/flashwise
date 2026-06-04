import { useTheme } from "@/providers/Theme";
import { FlatList, View } from "react-native";
import CardListItem from "./listItem";

const numbers = Array.from({ length: 100 }, (v, k) => k + 1);
const WordList = () => {
  const { theme } = useTheme();
  return (
    <View>
      <View
        style={{ backgroundColor: theme.background }}
        className="rounded-b-lg gap-6"
      >
        <FlatList
          scrollEnabled={false}
          contentContainerStyle={{
            gap: 20,
            paddingHorizontal: 4,
            paddingVertical: 12,
          }}
          data={numbers}
          extraData={(item: number) => item.toString()}
          renderItem={({ item }) => {
            return <CardListItem />;
          }}
        />
        {/* {Array.from({ length: 100 }).map((_, index) => (
          <View key={index}>
            <CardListItem />
          </View>
        ))} */}
      </View>
    </View>
  );
};

export default WordList;
