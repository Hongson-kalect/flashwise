import AppCheckbox from "@/components/AppCheckbox";
import AppText from "@/components/AppText";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

const WordListItem = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/screens/Word/Detail/${2}`)}
      className="flex-row h-16 items-center gap-2"
    >
      <View className="w-10 text-center">
        <AppCheckbox onChange={() => {}} checked={false} />
      </View>
      <AppText size={"sm"} className="flex-1 text-center">
        Từ
      </AppText>
      <AppText size={"sm"} className="w-16 text-center">
        {Math.floor(Math.random() * 10)}
      </AppText>
      <AppText size={"sm"} className="w-16 text-center">
        {["n", "v", "adj"][Math.floor(Math.random() * 3)]}
      </AppText>
      {/* <View className="w-8 h-4 bg-red-400 text-center"></View> */}

      <AppText size={"sm"} className="w-24 text-center" numberOfLines={1}>
        Collection nêm
      </AppText>
    </TouchableOpacity>
  );
};

export default WordListItem;
