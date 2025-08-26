import { AppContainer } from "@/components/AppContainer";
import AppIcon from "@/components/AppIcon";
import AppTitle from "@/components/AppTitle";
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
          <View className="flex-row items-center gap-2">
            <AppTitle title="Trending" />
            <AppIcon
              branch="fa6"
              name={"arrow-trend-up"}
              size={20}
              color="title"
            />
          </View>
          <DiscoverSuggesstion />
          <View className="flex-row items-center gap-2">
            <AppTitle title="Discover" />
            <AppIcon branch="antd" name={"find"} size={20} color="title" />
          </View>
          <DiscoverCollection />
        </AppContainer>
      </ScrollView>
    </View>
  );
};

export default DiscoverList;
