import AppTitle from "@/components/AppTitle";
import EditIcon from "@/components/icons/editIcon";
import TagItem from "@/components/TagItem";
import { useBottomSheet } from "@/providers/BottomSheet";
import { TouchableOpacity, View } from "react-native";
import WordSelectForm from "../../Word/Create/components/wordSelectForm";

const CollectionTags = () => {
  const { present } = useBottomSheet();

  const handleSelectTag = () => {
    present({
      render: () => <WordSelectForm />,
      title: "Collection tags",
      size: "full",
    });
  };
  return (
    <>
      <AppTitle title="Tags" />

      <TouchableOpacity
        onPress={handleSelectTag}
        className="flex-row gap-2 items-center"
      >
        <View className="flex-row gap-2 flex-wrap p-2 flex-1">
          {[1, 2, 3, 4].map((item, index) => (
            <TagItem key={index}>{"item " + item}</TagItem>
          ))}
        </View>

        <View className="w-8">
          <EditIcon />
        </View>
      </TouchableOpacity>
    </>
  );
};

export default CollectionTags;
