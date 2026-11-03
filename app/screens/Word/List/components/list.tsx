import { useTheme } from "@/providers/Theme";
import { FlatList, View } from "react-native";
import { WordRow } from "@/database/queries/words";
import CardListItem from "./listItem";

// Tạm cho màn Collection chi tiết (dữ liệu giả) tới khi trang đó được làm lại bằng dữ liệu thật
const sample = (n: number): WordRow => ({
  wordId: String(n),
  value: "table",
  languageCode: "en",
  ipa: "/ˈteɪ.bəl/",
  imageUri: null,
  senseCount: 1,
  posList: ["noun"],
  level: null,
  gloss: "cái bàn",
  learned: false,
});

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
            return <CardListItem word={sample(item)} />;
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
