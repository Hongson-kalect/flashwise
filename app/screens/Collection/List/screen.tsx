import AppButton from "@/components/AppButton";
import { AppContainer } from "@/components/AppContainer";
import { AppDivider } from "@/components/AppDivider";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
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
import CollectionSumary from "./components/sumary";

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

      <View>
        <AppDivider />
      </View>

      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View className="my-4">
          <CollectionSumary />
        </View>
        <AppContainer>
          <View className="flex-row justify-between items-center">
            <AppText color="subText3">
              <AppText size={28} weight="bold" color="primary">
                14
              </AppText>
              {" Collection(s)"}
            </AppText>

            <AppButton
              onPress={() => {
                router.push("/screens/Collection/Create/screen");
              }}
              type="success"
            >
              <AppIcon name="plus" branch="fa6" size={16} color="white" />
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
