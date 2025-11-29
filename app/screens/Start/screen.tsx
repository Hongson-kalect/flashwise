import AppButton from "@/components/AppButton";
import AppCheckbox from "@/components/AppCheckbox";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const startPageInfo: { title: string; description: string; image: string }[] = [
  {
    title: "Xây vốn từ vựng mỗi ngày",
    description:
      "Khám phá kho từ phong phú với ví dụ, cách phát âm, và nhiều ngôn ngữ. Học từ vựng dễ hơn bao giờ hết.",
    image: require("@/assets/images/start-page-1.png"),
  },
  {
    title: "Ôn tập theo cách bạn nhớ lâu nhất",
    description:
      "Thuật toán nhắc lại ngắt quãng giúp bạn ghi nhớ hiệu quả. Bạn chỉ cần mở app và học đúng lúc.",
    image: require("@/assets/images/start-page-2.png"),
  },
  {
    title: "Từ vựng theo sở thích của bạn",
    description:
      "Tạo bộ từ riêng, thêm hình ảnh, ví dụ hoặc sử dụng dữ liệu mẫu có sẵn từ hệ thống.",
    image: require("@/assets/images/start-page-3.png"),
  },
];

const StartPage = () => {
  const flatListRef = useRef<FlatList>(null);

  const { theme } = useTheme();
  const goToTab = (tab: number) => {
    flatListRef.current?.scrollToIndex({
      index: tab,
      animated: true,
    });
  };
  const start = async () => {
    router.replace("/screens/Start/Config/screen");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <FlatList
        ref={flatListRef}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        horizontal
        data={startPageInfo}
        pagingEnabled
        renderItem={({ item, index }) => {
          return (
            <StartNotify
              index={index}
              title={item.title}
              image={item.image}
              description={item.description}
              onNext={() => goToTab(index + 1)}
              onPrev={() => goToTab(index - 1)}
              onStart={() => start()}
            />
          );
        }}
      />
    </View>
  );
};

export default StartPage;

const StartNotify = ({
  title,
  image,
  index,
  description,
  onNext,
  onPrev,
  onStart,
}: {
  title: string;
  image: string;
  index: number;
  description: string;
  onNext: () => void;
  onPrev: () => void;
  onStart: () => void;
}) => {
  const { width, height } = useWindowDimensions();
  const [isCheckPolicy, setIsCheckPolicy] = useState(false);

  return (
    <View style={{ width }} className="justify-between pt-12 h-full px-3">
      <View className="items-center flex-1">
        <View>
          <AppText size={"xl"} color="primary" font="MulishBold">
            {title}
          </AppText>
        </View>

        <View
          className="mt-8 p-3"
          style={{
            width: Math.min(width, height),
            height: Math.min(width, height),
          }}
        >
          <Image className="h-full w-full rounded-xl" source={image} />
        </View>
        <AppText className="mt-4" color="subText1">
          {description}
        </AppText>
      </View>

      <View>
        {index === 2 && (
          <View className="flex-row items-center gap-2 mb-4">
            <TouchableOpacity
              onPress={() => setIsCheckPolicy(!isCheckPolicy)}
              className="h-10 w-10 items-center justify-center"
            >
              <AppCheckbox
                onChange={() => setIsCheckPolicy(!isCheckPolicy)}
                checked={isCheckPolicy}
                scale={1.5}
              />
            </TouchableOpacity>
            <AppText size={"sm"} className="flex-1">
              Tôi đã đọc và chấp nhận các{" "}
              <AppText
                onPress={() => router.push("/screens/Policy/screen")}
                size={"sm"}
                className="flex-1"
                color="secondary"
                style={{ textDecorationLine: "underline" }}
              >
                Chính sách & Điều khoản sử dụng
              </AppText>{" "}
              của ứng dụng
            </AppText>
          </View>
        )}

        <View
          style={{ width: "100%" }}
          className="w-full mb-6 items-center justify-between flex-row"
        >
          {index !== 0 ? (
            <AppButton
              size="lg"
              type="disabled"
              onPress={onPrev}
              title="Prev"
            ></AppButton>
          ) : (
            <View></View>
          )}
          {index !== 2 ? (
            <AppButton size="lg" onPress={onNext}>
              <AppText color="white" size={"lg"}>
                Next
              </AppText>
              <AppIcon
                name="arrow-right"
                branch="feather"
                size={18}
                color="white"
              />
            </AppButton>
          ) : (
            <AppButton
              type={isCheckPolicy ? "primary" : "disabled"}
              disabled={!isCheckPolicy}
              size="lg"
              onPress={onStart}
            >
              <AppText color="white" size={"lg"}>
                Start
              </AppText>
              <AppIcon
                name="external-link"
                branch="feather"
                size={18}
                color="white"
              />
            </AppButton>
          )}
        </View>
      </View>
    </View>
  );
};
