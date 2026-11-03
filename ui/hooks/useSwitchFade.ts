import { useEffect, useRef } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/**
 * Mờ rồi hiện lại khi nội dung đổi kiểu (đổi tab con, chế độ xem...). Truyền khoá nội dung; gán style trả về
 * cho 1 view bọc ngoài (chỉ animate opacity, không đụng từng phần tử bên trong).
 */
export const useSwitchFade = (key: string) => {
  const opacity = useSharedValue(1);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    opacity.value = 0.25;
    opacity.value = withTiming(1, { duration: 260 });
  }, [key, opacity]);

  return useAnimatedStyle(() => ({ opacity: opacity.value }));
};
