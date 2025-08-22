import { router } from "expo-router";
import {
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import CollectionItem from "../../../components/item";

const DiscoverCollection = () => {
  const { width } = useWindowDimensions();
  return (
    <View>
      <FlatList
        scrollEnabled={false}
        contentContainerStyle={{ gap: 12 }}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        data={[1, 2, 3, 4, 5]}
        renderItem={() => (
          <TouchableOpacity
            style={{ width: (width - 24) / 2 - 6 }}
            onPress={() => {
              router.push("/screens/Collection/Discover/Detail/1");
            }}
          >
            <CollectionItem />
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={() => <View className="h-10" />}
      />
    </View>
  );
};

export default DiscoverCollection;
