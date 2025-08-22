import { View } from "react-native";
import AppText from "./AppText";

type Props = {
  children: React.ReactNode;
};
const TagItem = ({ children }: Props) => {
  return (
    <View className="px-2 py-1 rounded-lg bg-gray-200">
      <AppText color="subText2" size="xs">
        {children}
      </AppText>
    </View>
  );
};

export default TagItem;
