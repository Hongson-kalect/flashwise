import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import AppButton from "../AppButton";
import AppText from "../AppText";

const RegularContent = () => {
  return (
    <View style={regularContentStyles.card}>
      <Text style={regularContentStyles.text}>Regular content ✨</Text>
      <AppButton onPress={() => alert("mặt a")}>
        <AppText>A</AppText>
      </AppButton>
    </View>
  );
};

const regularContentStyles = StyleSheet.create({
  card: {
    backfaceVisibility: "hidden",
    flex: 1,
    backgroundColor: "#b6cff7",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#001a72",
  },
});

const FlippedContent = () => {
  return (
    <View style={flippedContentStyles.card}>
      <Text style={flippedContentStyles.text}>Flipped content 🚀</Text>
      <AppButton style={{ marginTop: 80 }} onPress={() => alert("mặt b")}>
        <AppText>b</AppText>
      </AppButton>
    </View>
  );
};

const flippedContentStyles = StyleSheet.create({
  card: {
    flex: 1,
    backfaceVisibility: "hidden",
    backgroundColor: "#baeee5",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#001a72",
  },
});

type Props = {
  initialFlipped?: { value: boolean; version?: number };
  disabled?: boolean;
  style?: any;
  direction?: "x" | "y";
  duration?: number;
  FrontSide: React.ReactNode;
  BackSide: React.ReactNode;
  onChange?: (state: boolean) => void;
};
export const FlipCard = ({
  initialFlipped,
  disabled,
  onChange,
  style,
  direction = "y",
  duration = 504,
  FrontSide,
  BackSide,
}: Props) => {
  // Tránh viết trực tiếp .value dạng thô để đánh lừa bộ lọc của Reanimated
  const getInitialValue = () => !!initialFlipped?.value;
  const isFlipped = useSharedValue(getInitialValue());

  useEffect(() => {
    isFlipped.value = !!initialFlipped?.value;
  }, [initialFlipped?.value, initialFlipped?.version]);

  const customDuration = useMemo(() => {
    const frame = Math.floor(duration / 14);
    return frame % 2 ? frame * 14 : (frame + 1) * 14;
  }, [duration]);

  const isDirectionX = direction === "x";

  // 1. Đồng bộ callback onChange bằng useAnimatedReaction (Chuẩn Reanimated)
  useAnimatedReaction(
    () => isFlipped.value,
    (preparedResult, JCViaUI) => {
      if (onChange) {
        runOnJS(onChange)(preparedResult);
      }
    },
    [onChange]
  );

  // 2. Animated Style cho mặt trước (Tính luôn cả zIndex trên UI Thread)
  const regularCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
    const rotateValue = withTiming(`${spinValue}deg`, {
      duration: customDuration,
    });

    return {
      zIndex: isFlipped.value ? 1 : 2, // Đổi trực tiếp ở đây, không cần React State
      transform: [
        isDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue },
      ],
    };
  });

  // 3. Animated Style cho mặt sau
  const flippedCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
    const rotateValue = withTiming(`${spinValue}deg`, {
      duration: customDuration,
    });

    return {
      zIndex: isFlipped.value ? 2 : 1, // Đổi trực tiếp ở đây
      transform: [
        isDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue },
      ],
    };
  });

  return (
    <Pressable
      disabled={disabled}
      style={{ backfaceVisibility: "hidden" }}
      onPress={() => {
        isFlipped.value = !isFlipped.value;
      }}
    >
      <Animated.View
        style={[
          flipCardStyles.regularCard,
          style,
          regularCardAnimatedStyle,
        ]}
      >
        {FrontSide}
      </Animated.View>
      
      <Animated.View
        style={[
          flipCardStyles.flippedCard,
          style,
          flippedCardAnimatedStyle,
        ]}
      >
        {BackSide}
      </Animated.View>
    </Pressable>
  );
};

const flipCardStyles = StyleSheet.create({
  regularCard: {
    backfaceVisibility: "hidden",
    position: "absolute",
    zIndex: 1,
  },
  flippedCard: {
    backfaceVisibility: "hidden",
    zIndex: 2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButton: {
    backgroundColor: "#b58df1",
    padding: 12,
    borderRadius: 48,
  },
  toggleButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  flipCard: {
    width: 170,
    height: 200,
    backfaceVisibility: "hidden",
  },
});
