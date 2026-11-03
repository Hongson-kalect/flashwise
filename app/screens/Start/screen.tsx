import AppIcon from "@/components/AppIcon";
import AppImage from "@/components/AppImage";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  ImageSourcePropType,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const slides: {
  title: string;
  description: string;
  image: ImageSourcePropType;
}[] = [
  {
    title: "Xây vốn từ vựng mỗi ngày",
    description:
      "Kho từ phong phú với ví dụ, cách phát âm và nhiều ngôn ngữ. Học từ vựng chưa bao giờ dễ đến thế.",
    image: require("@/assets/images/start-page-1.webp"),
  },
  {
    title: "Ôn đúng lúc, nhớ thật lâu",
    description:
      "Thuật toán nhắc lại ngắt quãng (FSRS) báo bạn ôn đúng lúc sắp quên. Chỉ cần mở app và học.",
    image: require("@/assets/images/start-page-2.webp"),
  },
  {
    title: "Từ vựng theo sở thích",
    description:
      "Tạo bộ từ riêng, thêm hình ảnh và ví dụ, hoặc dùng ngay các bộ có sẵn từ cộng đồng.",
    image: require("@/assets/images/start-page-3.webp"),
  },
];

const StartPage = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const isLast = index === slides.length - 1;

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const goTo = (i: number) =>
    listRef.current?.scrollToIndex({ index: i, animated: true });

  const canStart = !isLast || accepted;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="flex-row justify-end px-5 pt-3 h-10">
        {!isLast && (
          <Pressable hitSlop={12} onPress={() => goTo(slides.length - 1)}>
            <AppText color="subText2" font="MulishSemiBold">
              Bỏ qua
            </AppText>
          </Pressable>
        )}
      </View>

      <Animated.FlatList
        ref={listRef as any}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.title}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center px-6">
            <View
              className="w-full flex-1 max-h-[46%] rounded-3xl overflow-hidden mt-2"
              style={{ backgroundColor: theme.card }}
            >
              <AppImage
                source={item.image}
                className="h-full w-full"
                contentFit="contain"
              />
            </View>
            <AppText
              size="3xl"
              font="MulishBold"
              color="title"
              textAlign="center"
              className="mt-8 text-center"
            >
              {item.title}
            </AppText>
            <AppText
              color="subText2"
              size="md"
              className="mt-3 text-center"
              style={{ textAlign: "center", lineHeight: 24 }}
            >
              {item.description}
            </AppText>
          </View>
        )}
      />

      <View className="px-6 pb-8">
        <View className="flex-row justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <Dot key={i} i={i} scrollX={scrollX} width={width} />
          ))}
        </View>

        {isLast && (
          <Pressable
            onPress={() => setAccepted(!accepted)}
            className="flex-row items-center gap-3 mb-4"
          >
            <View
              className="h-6 w-6 rounded-md items-center justify-center border-2"
              style={{
                borderColor: accepted ? theme.primary : theme.subText3,
                backgroundColor: accepted ? theme.primary : "transparent",
              }}
            >
              {accepted && (
                <AppIcon branch="feather" name="check" size={14} color="white" />
              )}
            </View>
            <AppText size="sm" className="flex-1" color="subText1">
              Tôi đã đọc và đồng ý với{" "}
              <AppText
                size="sm"
                color="primary"
                font="MulishSemiBold"
                onPress={() => router.push("/screens/Policy/screen")}
              >
                Chính sách & Điều khoản
              </AppText>
            </AppText>
          </Pressable>
        )}

        <Pressable
          disabled={!canStart}
          onPress={() =>
            isLast ? router.replace("/screens/Start/Config/screen") : goTo(index + 1)
          }
          className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
          style={{
            backgroundColor: canStart ? theme.primary : theme.disabled,
            opacity: canStart ? 1 : 0.6,
          }}
        >
          <AppText color="white" size="lg" font="MulishBold">
            {isLast ? "Bắt đầu" : "Tiếp tục"}
          </AppText>
          <AppIcon branch="feather" name="arrow-right" size={20} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

const Dot = ({
  i,
  scrollX,
  width,
}: {
  i: number;
  scrollX: Animated.SharedValue<number>;
  width: number;
}) => {
  const { theme } = useTheme();
  const style = useAnimatedStyle(() => {
    const range = [(i - 1) * width, i * width, (i + 1) * width];
    return {
      width: interpolate(scrollX.value, range, [8, 24, 8], Extrapolation.CLAMP),
      opacity: interpolate(scrollX.value, range, [0.35, 1, 0.35], Extrapolation.CLAMP),
    };
  });
  return (
    <Animated.View
      style={[{ height: 8, borderRadius: 4, backgroundColor: theme.primary }, style]}
    />
  );
};

export default StartPage;
