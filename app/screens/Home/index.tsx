import { useTheme } from "@/providers/Theme";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { router, useFocusEffect } from "expo-router";
import { ReactNode, useCallback, useState } from "react";
import { Pressable, RefreshControl, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import HabitCard from "./components/habitCard";
import HomeHeader from "./components/header";
import Mistakes from "./components/mistakes";
import Progress from "./components/progress";
import HomeSearch from "./components/search";
import StudyCard from "./components/studyCard";
import Suggested from "./components/suggested";
import { useHomeData } from "./useHomeData";

export default function HomePage() {
  const { theme } = useTheme();
  const { data, isLoading, refetch, isRefetching, dailyGoal } = useHomeData();

  // Quay lại Home sau khi học thì số liệu cập nhật ngay
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Gợi ý tìm kiếm vẽ ở gốc màn hình (ngoài ScrollView) để nổi lên trên, không đẩy layout bên dưới
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const [searchY, setSearchY] = useState(0);
  const [overlay, setOverlay] = useState<ReactNode>(null);

  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32, gap: 16 }}
      >
        <View className="px-4">
          <HomeHeader streak={data?.habit.state.streak} shield={data?.habit.state.shield} xp={data?.habit.totalXp} />
        </View>
        <View className="px-4" onLayout={(e) => setSearchY(e.nativeEvent.layout.y)}>
          <HomeSearch anchorY={searchY} scrollY={scrollY} setOverlay={setOverlay} />
        </View>
        {/* Tạm: thử micro + nhận dạng giọng nói không cần vào phiên học (bỏ khi voice đã ổn trên các máy) */}
        <View className="px-4">
          <Pressable
            onPress={() => router.push("/screens/VoiceTest/screen")}
            className="flex-row items-center justify-center gap-2 h-10 rounded-full"
            style={{ borderWidth: 1, borderColor: theme.border, borderStyle: "dashed" }}
          >
            <AppIcon branch="feather" name="mic" size={16} color={theme.primary} />
            <AppText size="sm" weight="semibold" style={{ color: theme.primary }}>
              Thử giọng nói
            </AppText>
          </Pressable>
        </View>
        <View className="px-4">
          <StudyCard due={data?.due ?? 0} loading={isLoading} />
        </View>
        <View className="px-4">
          <Progress
            week={data?.week ?? []}
            today={data?.today}
            goal={dailyGoal}
          />
        </View>
        <View className="px-4">
          <HabitCard view={data?.habit} />
        </View>
        <Mistakes items={data?.mistakes ?? []} />
        <Suggested />
      </Animated.ScrollView>
      {overlay}
    </View>
  );
}
