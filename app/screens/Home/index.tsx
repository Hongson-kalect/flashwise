import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import AppLineChart from "@/components/chart/line";
import { BarChartSkeleton } from "@/components/skeleton/ChartSkeleton";
import {
  CollectionSkeleton,
  WordSearchSkeleton,
  WordSkeleton,
} from "@/components/skeleton/WordSkeleton";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useLanguage, useT } from "@/providers/Language";
import { useTheme } from "@/providers/Theme";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Divider } from "react-native-paper";
import Discover from "./components/discover";
import HomeHeader from "./components/header";
import HomeSearch from "./components/homeSearch";
import Relearn from "./components/relearn";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const t = useT();
  const { language, setLanguage } = useLanguage();
  const { present } = useBottomSheet();

  const openSheet = (size: "short" | "medium" | "long" | "full") => {
    present({
      render: () => <AppText>Sheet {size}</AppText>,
      title: "Sheet " + size,
      size,
    });
  };

  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <ScrollView>
        <View
          className="px-2 pb-1"
          style={{ backgroundColor: theme.background }}
        >
          <HomeHeader />
        </View>

        <View className="px-4">
          <WordSearchSkeleton />
          <Divider style={{ marginVertical: 4 }} />
          <WordSearchSkeleton />
          <Divider style={{ marginVertical: 4 }} />
          <WordSearchSkeleton />
          <Divider style={{ marginVertical: 4 }} />
          <WordSearchSkeleton />
          <Divider style={{ marginVertical: 4 }} />
          <WordSkeleton />
          <Divider style={{ marginVertical: 4 }} />
          <CollectionSkeleton />
          <BarChartSkeleton />
        </View>

        <View className="px-3 mt-6">
          <HomeSearch />
        </View>

        {/* <View className="px-3 mt-6">
          <HomeTarget />
        </View> */}

        <View className="px-3 mt-8">
          <Relearn />
          {/* <View className="h-4"></View>
          <LearnNew /> */}

          <View className="mt-10">
            <AppTitle title="Mini games" />

            <View className="flex-row mt-4 items-center gap-6 flex-wrap">
              <View className="h-14 w-14 bg-red-400 rounded  overflow-hidden">
                <Image
                  source={{ uri: "https://picsum.photos/600/600" }}
                  className="h-full w-full"
                  style={{ resizeMode: "cover" }}
                />
              </View>
              <View className="h-14 w-14 bg-red-400 rounded overflow-hidden">
                <Image
                  source={{ uri: "https://picsum.photos/600/600" }}
                  className="h-full w-full"
                  style={{ resizeMode: "cover" }}
                />
              </View>
              <View className="h-14 w-14 bg-red-400 rounded overflow-hidden">
                <Image
                  source={{ uri: "https://picsum.photos/600/600" }}
                  className="h-full w-full"
                  style={{ resizeMode: "cover" }}
                />
              </View>
              <View className="h-14 w-14 bg-red-400 rounded overflow-hidden">
                <Image
                  source={{ uri: "https://picsum.photos/600/600" }}
                  className="h-full w-full"
                  style={{ resizeMode: "cover" }}
                />
              </View>
              <View className="h-14 w-14 bg-red-400 rounded overflow-hidden">
                <Image
                  source={{ uri: "https://picsum.photos/600/600" }}
                  className="h-full w-full"
                  style={{ resizeMode: "cover" }}
                />
              </View>
              <View className="h-14 w-14 bg-red-400 rounded overflow-hidden">
                <Image
                  source={{ uri: "https://picsum.photos/600/600" }}
                  className="h-full w-full"
                  style={{ resizeMode: "cover" }}
                />
              </View>
            </View>
          </View>

          <View className="mt-10">
            <AppTitle title="Dashboard" />

            <View className="mt-4 flex-row gap-2">
              {["Learned Words", "Learned Time"].map((item, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      backgroundColor: index !== 0 ? "#e5e7eb" : theme.primary,
                    }}
                    className="flex-row items-center px-3 py-1.5 bg-gray-100 rounded-lg"
                  >
                    <AppText
                      color={index !== 0 ? "subText2" : "white"}
                      size={"sm"}
                    >
                      {item}
                    </AppText>
                  </View>
                );
              })}
            </View>

            <View
              className="mt-8"
              style={{ height: 200, backgroundColor: "white" }}
            >
              <AppLineChart />
            </View>
          </View>

          <View className="mt-10">
            <Discover />
          </View>
        </View>
        {/* header */}
        {/* xin chào */}
        {/* Panel mục tiêu học */}
        {/* ảnh nhắc học lại | Học thêm từ mới => ưu tiên học lại. Học lại hết rồi thì mới học thêm từ mới  */}
        {/* Dashboard tiến độ số từ đã học || số ngày đã học || streak đăng nhập*/}
        {/* Các tiện ích khác nếu có (mini game), (news) song ngữ,... Nhưng hiện tại không có gì */}
        {/* 🧩 6. Góc khám phá
        “Từ thú vị hôm nay: ‘sonder’ – cảm giác nhận ra ai cũng có câu chuyện riêng”

        “Từ được chia sẻ nhiều nhất tuần này: ‘resilience’”
        “Từ Khó nhớ nhất tuần (lấy từ bị quên nhiều nhất trong 7 ngày gần nhất)

        → Tạo chiều sâu ngôn ngữ, không chỉ là học để nhớ.
          */}

        {/* Footer, nhưng footer có gì? */}

        {/* <AppText style={{ color: theme.text }}>
          HomePage here {t("hello", { name: "John" })}
        </AppText>

        <AppButton
          title="To VN language"
          onPress={() => setLanguage("vi")}
          type="primary"
          // disabled
        ></AppButton>
        <AppButton
          title="To EN language"
          onPress={() => setLanguage("en")}
          type="secondary"
        ></AppButton>
        <AppButton
          title="Dark mode"
          onPress={() => setTheme("dark")}
          type="error"
        ></AppButton>
        <AppButton
          title="Light mode"
          onPress={() => setTheme("light")}
          type="success"
        ></AppButton>
        <AppButton
          title="Test short sheet modal"
          onPress={() => openSheet("short")}
          type="success"
        ></AppButton>
        <AppButton
          title="Test medium sheet modal"
          onPress={() => openSheet("medium")}
          type="success"
        ></AppButton>
        <AppButton
          title="Test long sheet modal"
          onPress={() => openSheet("long")}
          type="success"
        ></AppButton>
        <AppButton
          title="Test full sheet modal"
          onPress={() => openSheet("full")}
          type="success"
        ></AppButton> */}

        <View className="h-10"></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({});
