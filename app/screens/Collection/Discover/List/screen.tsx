import { AppContainer } from "@/components/AppContainer";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { ScrollView, View } from "react-native";
import DiscoverCollection from "./components/discover";
import DiscoverListHeader from "./components/header";
import DiscoverSuggesstion from "./components/suggesstion";

const DiscoverList = () => {
  const { theme } = useTheme();
  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View>
        <DiscoverListHeader mode="view" setMode={() => {}} />
      </View>

      <ScrollView>
        <AppContainer className="flex-1">
          <AppText>Suggestion</AppText>
          <DiscoverSuggesstion />
          <AppText>Discover</AppText>
          <DiscoverCollection />
        </AppContainer>
      </ScrollView>
    </View>
  );
};

export default DiscoverList;
