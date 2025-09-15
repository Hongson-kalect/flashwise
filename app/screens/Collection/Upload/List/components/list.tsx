import { View } from "react-native";
import CollectionItem from "../../../components/item";

const MyUploadList = () => {
  return (
    <View className="gap-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <CollectionItem key={index} />
      ))}
    </View>
  );
};

export default MyUploadList;
