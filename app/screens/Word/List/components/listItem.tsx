import AppCheckbox from "@/components/AppCheckbox";
import AppText from "@/components/AppText";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

const WordListItem = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/screens/Word/Detail/${2}`)}
      className="flex-row h-16 items-center gap-2"
    >
      <TouchableOpacity
        onPress={() => {}}
        className="w-12 h-full items-center justify-center"
      >
        <AppCheckbox onChange={() => {}} checked={false} />
      </TouchableOpacity>
      <AppText size={"sm"} className="flex-1 text-center">
        Từ
      </AppText>
      <AppText size={"sm"} className="w-16 text-center">
        {["n", "v", "adj"][Math.floor(Math.random() * 3)]}
      </AppText>
      <AppText size={"sm"} className="w-16 text-center">
        {Math.floor(Math.random() * 10)}
      </AppText>
      {/* <View className="w-8 h-4 bg-red-400 text-center"></View> */}

      {/* <AppText size={"sm"} className="w-24 text-center" numberOfLines={1}>
        Collection nêm
      </AppText> */}
    </TouchableOpacity>
  );
};

export default WordListItem;
