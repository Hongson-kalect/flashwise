import { useTheme } from "@/providers/Theme";
import { useWindowDimensions, View } from "react-native";
import CollectionItem from "../../components/item";

const CollectionList = () => {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  return (
    <View>
      <ListHeader />

      <View
        style={{ backgroundColor: theme.background }}
        className="rounded-b-lg gap-6 mt-4"
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <View key={index}>
            <CollectionItem />
          </View>
        ))}
      </View>
    </View>
  );
};

const ListHeader = () => {
  return <View></View>;
};

export default CollectionList;
