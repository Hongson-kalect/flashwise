import { AppContainer } from "@/components/AppContainer";
import { AppDivider } from "@/components/AppDivider";
import AppIcon from "@/components/AppIcon";
import { useTheme } from "@/providers/Theme";
import { useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ListHeader from "./components/header";
import CardList from "./components/list";
import ItemListHeader from "./components/listHeader";
import ListSumary from "./components/sumary";

export default function CardPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = new Animated.Value(0);

  const { theme } = useTheme();

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
    <View style={{ backgroundColor: theme.background2 }} className="flex-1">
      <View className="px-2 pb-1" style={{ backgroundColor: theme.background }}>
        <ListHeader />
      </View>

      <View>
        <AppDivider />
      </View>
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <AppContainer>
          <View className="my-4">
            <ListSumary />
          </View>

          <View className="mt-12">
            <ItemListHeader isSelecting={false} />
          </View>

          <View className="mt-4">
            <CardList />
          </View>
        </AppContainer>
        <View className="h-10"></View>
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
}

const styles = StyleSheet.create({
  scrollTopButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 50,
  },
});
