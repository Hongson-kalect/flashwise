import { routes } from "@/configs/bottomTab";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import { BottomNavigation } from "react-native-paper";
import CardPage from "./screens/Word/List";
import CollectionsPage from "./screens/Collection";
import HomePage from "./screens/Home";
import ProfilePage from "./screens/Profile";

export default function Layout() {
  const [activeTab, setActiveTab] = useState(0);
  const { theme } = useTheme();

  const renderScene = BottomNavigation.SceneMap({
    home: HomePage,
    collections: CollectionsPage,
    cards: CardPage,
    profile: ProfilePage,
  });

  const renderIcon = ({
    route,
    focused,
  }: {
    route: { key: string; title: string; icon: ImageSourcePropType };
    focused: boolean;
  }) => {
    return (
      <View className="relative h-14 w-14 -mt-4">
        {focused && (
          <View
            style={{
              height: "116%",
              width: "116%",
              top: "-8%",
              right: "-8%",
            }}
            className="absolute rounded-xl border-2 border-blue-400 bg-blue-200 "
          ></View>
        )}
        <Image
          className="h-full w-full rounded-3xl"
          style={{ resizeMode: "contain" }}
          source={route.icon}
        />
      </View>
    );
  };

  return (
    <>
      <BottomNavigation
        labeled={false}
        sceneAnimationType="shifting"
        style={{
          padding: 0,
        }}
        shifting={false}
        renderIcon={renderIcon}
        barStyle={{
          // height: 70,
          alignItems: "center",
          justifyContent: "center",
          borderTopWidth: 1,
          borderColor: "#e7e7e7",
          borderStyle: "solid",
          zIndex: 100,
          backgroundColor: "white",
          paddingVertical: 0,
          marginHorizontal: 0,
        }}
        activeIndicatorStyle={{ backgroundColor: "white" }}
        activeColor="#3865e0"
        inactiveColor="#aaa"
        navigationState={{ index: activeTab, routes }}
        onIndexChange={setActiveTab}
        theme={{
          colors: { primary: theme.primary, background: theme.background },
        }}
        renderScene={(props) => (
          <View style={{ flex: 1 }}>{renderScene(props)}</View>
        )}
      />
    </>
  );
}
