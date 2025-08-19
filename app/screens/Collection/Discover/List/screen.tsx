import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import DiscoverListHeader from "./components/header";

const DiscoverList = () => {
  const { theme } = useTheme();
  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View>
        <DiscoverListHeader mode="view" setMode={() => {}} />
      </View>

      <AppText>DiscoverList</AppText>
    </View>
  );
};

export default DiscoverList;
