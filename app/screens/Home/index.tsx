import { useTheme } from "@/providers/Theme";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import HomeHeader from "./components/header";
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

  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40, gap: 24 }}
      >
        <View className="px-4">
          <HomeHeader />
        </View>
        <View className="px-4">
          <HomeSearch />
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
        <Suggested />
      </ScrollView>
    </View>
  );
}
