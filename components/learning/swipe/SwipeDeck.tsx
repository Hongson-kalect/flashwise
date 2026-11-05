import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { directionFor, SwipeDirection, SwipeState } from "@/learning/swipe";
import { useTheme } from "@/providers/Theme";
import { ReactNode } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import SwipeCardFace from "./SwipeCardFace";

const THRESHOLD = 110;

type Tag = { text: string; color: string };

/** Thẻ kéo ngang được: vượt ngưỡng thì bay ra rồi báo bên đã vuốt; nhãn 2 mép hiện dần theo độ kéo. Mỗi thẻ 1 instance (key) nên vị trí tự về 0. */
const DraggableCard = ({ leftTag, rightTag, onSide, children }: { leftTag: Tag; rightTag: Tag; onSide: (side: "left" | "right") => void; children: ReactNode }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-16, 16])
    .failOffsetY([-14, 14]) // kéo dọc là cuộn nội dung thẻ, không phải vuốt
    .onUpdate((e) => {
      x.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > THRESHOLD) {
        const side = e.translationX < 0 ? "left" : "right";
        x.value = withTiming(side === "left" ? -width : width, { duration: 160 }, (finished) => {
          if (finished) runOnJS(onSide)(side);
        });
      } else {
        x.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { rotate: `${interpolate(x.value, [-width, 0, width], [-14, 0, 14])}deg` }],
  }));
  const leftOpacity = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-THRESHOLD, 0], [1, 0], "clamp") }));
  const rightOpacity = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, THRESHOLD], [0, 1], "clamp") }));

  const tagView = (tag: Tag, side: "left" | "right", style: any) => (
    <Animated.View
      pointerEvents="none"
      className="absolute top-4 px-3 h-9 rounded-full items-center justify-center"
      style={[{ backgroundColor: tag.color, [side]: 14 }, style]}
    >
      <AppText size="sm" weight="bold" color="white">
        {tag.text}
      </AppText>
    </Animated.View>
  );

  return (
    <GestureDetector gesture={pan}>
      <Animated.View className="flex-1 rounded-3xl overflow-hidden" style={[{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }, cardStyle]}>
        {children}
        {tagView(leftTag, "left", leftOpacity)}
        {tagView(rightTag, "right", rightOpacity)}
      </Animated.View>
    </GestureDetector>
  );
};

type Props = {
  state: SwipeState;
  /** Cài đặt swipe_direction: "left_remember" (mặc định) hoặc "right_remember". */
  directionSetting: string;
  onSwipe: (direction: SwipeDirection) => void;
  onFlip: () => void;
  onUndo: () => void;
};

const LABEL: Record<SwipeDirection, { text: string; icon: string }> = {
  remember: { text: "Nhớ", icon: "check" },
  unsure: { text: "Chưa chắc", icon: "help-circle" },
};

/** Chồng thẻ vuốt: kéo ngang (hoặc bấm nút) để chọn nhớ / chưa chắc; "Xem nghĩa" lật thẻ (tính Quên); hoàn tác 1 bước. */
const SwipeDeck = ({ state, directionSetting, onSwipe, onFlip, onUndo }: Props) => {
  const { theme } = useTheme();
  const item = state.current!;
  const run = state.cards[item.cardKey];

  const tone: Record<SwipeDirection, string> = { remember: theme.success, unsure: theme.warning };
  // Thẻ xem lại (đã quên) không chấm: cả 2 bên đều là "Tiếp"
  const tagOf = (side: "left" | "right"): Tag & { dir: SwipeDirection } => {
    const dir = item.review ? "remember" : directionFor(directionSetting, side);
    return { dir, text: item.review ? "Tiếp" : LABEL[dir].text, color: item.review ? theme.primary : tone[dir] };
  };
  const commit = (side: "left" | "right") => onSwipe(tagOf(side).dir);

  const sideButton = (side: "left" | "right") => {
    const tag = tagOf(side);
    return (
      <Pressable
        onPress={() => commit(side)}
        className="flex-1 h-14 rounded-2xl flex-row items-center justify-center gap-2"
        style={{ backgroundColor: tag.color + "1F", borderWidth: 1.5, borderColor: tag.color }}
      >
        <AppIcon branch="feather" name={(item.review ? "arrow-right" : LABEL[tag.dir].icon) as any} size={18} color={tag.color} />
        <AppText weight="bold" style={{ color: tag.color }}>
          {tag.text}
        </AppText>
      </Pressable>
    );
  };

  return (
    <View className="flex-1">
      <View className="flex-1 px-4 pt-1">
        <DraggableCard key={`${item.cardKey}:${item.review}:${state.finalized}:${run.score}:${run.flipped}`} leftTag={tagOf("left")} rightTag={tagOf("right")} onSide={commit}>
          <SwipeCardFace card={run.card} flipped={run.flipped} review={item.review} />
        </DraggableCard>
      </View>

      <View className="px-4 pt-3 pb-4 gap-3">
        {!item.review && run.score > 0 && !run.flipped && (
          <AppText size="xs" color="subText2" textAlign="center">
            {`Đã chọn "chưa chắc" ${run.score} lần, đến 3 lần thì tính là quên`}
          </AppText>
        )}
        <View className="flex-row gap-3">
          <Pressable
            onPress={onUndo}
            disabled={!state.prev}
            hitSlop={6}
            className="h-12 px-4 rounded-2xl flex-row items-center justify-center gap-1.5"
            style={{ borderWidth: 1.5, borderColor: theme.border, opacity: state.prev ? 1 : 0.4 }}
          >
            <AppIcon branch="feather" name="rotate-ccw" size={16} color={theme.text} />
            <AppText size="sm" weight="semibold" color="title">
              Hoàn tác
            </AppText>
          </Pressable>
          {!item.review && (
            <Pressable
              onPress={onFlip}
              disabled={run.flipped}
              className="flex-1 h-12 rounded-2xl flex-row items-center justify-center gap-1.5"
              style={{ borderWidth: 1.5, borderColor: theme.border, opacity: run.flipped ? 0.4 : 1 }}
            >
              <AppIcon branch="feather" name="eye" size={16} color={theme.text} />
              <AppText size="sm" weight="semibold" color="title">
                Xem nghĩa (tính là quên)
              </AppText>
            </Pressable>
          )}
        </View>
        <View className="flex-row gap-3">
          {sideButton("left")}
          {sideButton("right")}
        </View>
        <AppText size="xs" color="subText3" textAlign="center">
          {directionSetting === "right_remember" ? "Vuốt phải = nhớ, vuốt trái = chưa chắc" : "Vuốt trái = nhớ, vuốt phải = chưa chắc"}
        </AppText>
      </View>
    </View>
  );
};

export default SwipeDeck;
