import { useEffect, useState } from "react";
import { Dimensions, Keyboard, Platform } from "react-native";

/**
 * Chiều cao bàn phím tính từ đáy màn hình thật (px logic), dùng làm paddingBottom của khung gốc màn hình để ô nhập và nút
 * bên dưới luôn nằm trên bàn phím. Khung gốc của app chiếm cả màn hình (edge-to-edge) nên `KeyboardAvoidingView` trên Android
 * tính thiếu cỡ thanh điều hướng (`adjustResize` không còn tác dụng) và `endCoordinates.height` cũng không gồm phần đó;
 * lấy đáy màn hình trừ đỉnh bàn phím (screenY) thì đúng trên cả hai.
 * Đã đo trên emulator Android 16 (nút bấm dưới ô nhập từng bị bàn phím che 66-139px với hai cách tính kia).
 */
export const useKeyboardInset = () => {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", (e) => {
      setInset(Math.max(0, Dimensions.get("screen").height - e.endCoordinates.screenY));
    });
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setInset(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return inset;
};
