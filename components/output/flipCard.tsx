import React, { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
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
  isFlipped: SharedValue<boolean>;
  style?: any;
  direction?: "x" | "y";
  duration?: number;
  FrontSide: React.ReactNode;
  BackSide: React.ReactNode;
  onChange?: (state: boolean) => void;
};

export const FlipCard = ({
  isFlipped,
  onChange,
  style,
  direction = "y",
  duration = 504,
  FrontSide,
  BackSide,
}: Props) => {
  const customDuration = useMemo(() => {
    const frame = Math.floor(duration / 14);
    if (frame % 2) {
      return frame * 14;
    }
    return (frame + 1) * 14;
  }, [duration]);
  const isDirectionX = direction === "x";
  const [isFlip, setIsFlip] = useState(false);
  const timeout = useRef<NodeJS.Timeout | number>(0);
  const toggleCardSide = useCallback(
    (state: boolean) => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        console.log("brah");
        setIsFlip(state);
      }, customDuration / 2);
    },
    [customDuration]
  );

  const regularCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
    const rotateValue = withTiming(`${spinValue}deg`, {
      duration: customDuration,
    });

    // if (isFlipped.value) {
    console.log("isFlipped.value", isFlipped.value);
    runOnJS(toggleCardSide)(!!isFlipped.value);

    if (onChange) runOnJS(onChange)(!!isFlipped.value);
    // }

    return {
      transform: [
        isDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue },
      ],
    };
  });

  const flippedCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
    const rotateValue = withTiming(`${spinValue}deg`, {
      duration: customDuration,
    });

    return {
      transform: [
        isDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue },
      ],
    };
  });

  const handlePress = () => {
    isFlipped.value = !isFlipped.value;
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          flipCardStyles.regularCard,
          style,
          {
            zIndex: isFlip ? 1 : 2,
            backgroundColor: !isFlip ? "red" : "blue",
          },
          regularCardAnimatedStyle,
        ]}
      >
        {FrontSide}
      </Animated.View>
      <Animated.View
        style={[
          flipCardStyles.flippedCard,
          style,
          {
            zIndex: isFlip ? 2 : 1,
            backgroundColor: isFlip ? "red" : "blue",
          },
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
    position: "absolute",
    zIndex: 1,
  },
  flippedCard: {
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
