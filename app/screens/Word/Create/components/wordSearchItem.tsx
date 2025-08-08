import AppCheckbox from "@/components/AppCheckbox";
import AppText from "@/components/AppText";
import { TouchableOpacity } from "react-native";

const WordSearchItem = () => {
  return (
    <TouchableOpacity className="flex flex-row items-center  gap-4 py-4">
      <AppCheckbox checked={false} onChange={() => {}} />
      <AppText weight="500" size={"lg"}>
        Từ mẫu ê
      </AppText>
    </TouchableOpacity>
  );
};

export default WordSearchItem;
