import AppCheckbox from "@/components/AppCheckbox";
import AppText from "@/components/AppText";
import { TouchableOpacity } from "react-native";

const WordSearchItem = () => {
  return (
    <TouchableOpacity className="flex flex-row items-center gap-6 py-4 pl-2">
      <AppCheckbox scale={1.2} checked={false} onChange={() => {}} />
      <AppText weight="500" size={"lg"}>
        Từ mẫu ê
      </AppText>
    </TouchableOpacity>
  );
};

export default WordSearchItem;
