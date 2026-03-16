import { AppContainer } from "@/components/AppContainer";
import AppIcon from "@/components/AppIcon";
import { useTheme } from "@/providers/Theme";
import { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ListHeader from "./components/header";
import ItemListHeader from "./components/listHeader";
import WordListItem from "./components/listItem";
import ListSumary from "./components/sumary";

const numbers = Array.from({ length: 100 }, (v, k) => k + 1);

export default function CardPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { height } = useWindowDimensions();
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
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <View className="px-2 pb-1" style={{ backgroundColor: theme.background }}>
        <ListHeader />
      </View>

      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View className="my-4 px-3">
          <ListSumary />
        </View>
        <AppContainer>
          <View className="mt-8">
            <ItemListHeader isSelecting={false} />
          </View>

          <View className="mt-2">
            <View
              style={{
                backgroundColor: theme.background,
                marginHorizontal: -4,
              }}
              className="gap-6"
            >
              <FlatList
                scrollEnabled={false}
                contentContainerStyle={{
                  gap: 20,
                  paddingHorizontal: 4,
                  paddingVertical: 12,
                }}
                data={numbers}
                extraData={(item: number) => item.toString()}
                renderItem={({ item }) => {
                  return <WordListItem />;
                }}
              />
            </View>
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
