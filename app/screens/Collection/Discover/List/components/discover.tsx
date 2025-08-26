import AppSearch from "@/components/input/AppSearch";
import TagItem from "@/components/TagItem";
import { FlatList, useWindowDimensions, View } from "react-native";
import DiscoverItem from "./discoverItem";

const DiscoverCollection = () => {
  const { width } = useWindowDimensions();
  return (
    <View>
      <View className="flex-row gap-2 mt-3">
        <TagItem>Tag 1</TagItem>
      </View>
      <View className="mt-3 mb-4">
        <AppSearch />
      </View>
      <FlatList
        scrollEnabled={false}
        contentContainerStyle={{ gap: 24 }}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        data={[1, 2, 3, 4, 5]}
        renderItem={() => (
          <View style={{ width: (width - 24) / 2 - 4 }}>
            {/* <CollectionItem /> */}
            <DiscoverItem />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={() => <View className="h-10" />}
      />
    </View>
  );
};

export default DiscoverCollection;
