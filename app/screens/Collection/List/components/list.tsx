import { useWindowDimensions, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import CollectionItem from "../../components/item";

const CollectionList = () => {
  const { width } = useWindowDimensions();
  return (
    <View>
      <ListHeader />

      <View className="mt-4">
        <FlatList
          scrollEnabled={false}
          columnWrapperStyle={{ justifyContent: "space-between", gap: 8 }}
          numColumns={2}
          contentContainerStyle={{ gap: 16 }}
          data={[1, 2, 3, 4, 5]}
          renderItem={({ item }) => (
            <View className="p-1" style={{ width: (width - 24) / 2 - 4 }}>
              <CollectionItem />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={() => <View className="h-10" />}
        />
      </View>
    </View>
  );
};

const ListHeader = () => {
  return <View></View>;
};

export default CollectionList;
