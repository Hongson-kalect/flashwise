import AppButton from "@/components/AppButton";
import { AppContainer } from "@/components/AppContainer";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import CollectionListHeader from "./components/header";
import CollectionList from "./components/list";
import ItemListHeader from "./components/listHeader";

const CollectionListScreen = () => {
  const { theme } = useTheme();
  const scrollRef = React.useRef<ScrollView>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollY = new Animated.Value(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    setShowScrollTop(contentOffset.y > layoutMeasurement.height);
    scrollY.setValue(contentOffset.y);
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollY.setValue(0);
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <View className="px-2 pb-1" style={{ backgroundColor: theme.background }}>
        <CollectionListHeader />
      </View>

      {/* <View>
        <AppDivider />
      </View> */}

      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* <View className="my-4 px-3">
          <CollectionSumary />
        </View> */}
        <AppContainer>
          <View className="items-center mt-2">
            <AppText font="MulishExtraBold" size={64} color="primary">
              14
            </AppText>

            <MaterialCommunityIcons
              name="cards"
              size={64}
              color={theme.subText3}
            />
          </View>

          <View className="flex-row justify-center gap-8 mt-2 items-center">
            <AppButton
              onPress={() => {
                router.push("/screens/Collection/Create/screen");
              }}
              type="primary"
              size="lg"
            >
              <AppIcon
                name="external-link"
                branch="feather"
                size={16}
                color="white"
              />
              <AppText color="white">Discover</AppText>
            </AppButton>
            <AppButton
              onPress={() => {
                router.push("/screens/Collection/Create/screen");
              }}
              size="lg"
              type="success"
            >
              <AppIcon name="plus" branch="antd" size={16} color="white" />
              <AppText color="white">Create</AppText>
            </AppButton>
          </View>
          <View className="mt-8">
            <ItemListHeader isSelecting={false} />
          </View>

          <View>
            <CollectionList />
          </View>
        </AppContainer>
      </ScrollView>

      {showScrollTop && (
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            backgroundColor: theme.subText1,
            padding: 10,
            borderRadius: 50,
          }}
          onPress={scrollToTop}
        >
          <AppIcon
            branch="feather"
            name="arrow-up"
            size={24}
            color={theme.background}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CollectionListScreen;
