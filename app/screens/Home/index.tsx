import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import AppLineChart from "@/components/chart/line";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useLanguage, useT } from "@/providers/Language";
import { useTheme } from "@/providers/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import Discover from "./components/discover";
import HomeHeader from "./components/header";
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

        <View className="px-3 mt-6">
          {/* <View
            style={{
              height: 1,
              backgroundColor: theme.subText3,
              marginBottom: -0.1,
            }}
          >
            <View
              style={{
                height: 1,
                backgroundColor: theme.success,
                width: "80%",
              }}
            ></View>
          </View> */}
          <LinearGradient
            colors={[theme.success + "66", "transparent"]}
            // Tôi muốn nó có 2 màu nhưng có thể kiểm soát được độ rộng của màu đầu tiên ví dụ 90% màu 1 và 10% màu 2
            // The locations array is used to define the gradient stops.
            // The first value is the starting point of the gradient (0 being the left side and 1 being the right side).
            // The second value is the ending point of the gradient (0 being the left side and 1 being the right side).
            // In this case, we are starting the gradient at 10% from the left side and ending it at 90% from the left side.
            locations={[0.7, 0.9]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              backgroundColor: theme.background,
              borderRadius: 10,
              elevation: 5,
              borderColor: theme.success,
              shadowColor: theme.success,
            }}
            className="flex-row items-center gap-2 p-2 justify-between"
          >
            <View className="flex-row gap-4 items-center ml-2">
              <View>
                <AppIcon
                  branch="feather"
                  name="book-open"
                  size={28}
                  color="secondary"
                />
              </View>
              <View>
                <AppText size={"xs"} color="subText2">
                  Mục tiêu 🎯
                </AppText>

                <View className="">
                  <AppText font="MulishMedium" color="primary">
                    10 từ vựng mới
                  </AppText>
                </View>
              </View>
            </View>
            <View className="pr-4 p-2 items-center justify-center">
              <AppIcon branch="feather" size={20} name="refresh-ccw" />
            </View>
          </LinearGradient>
        </View>

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
