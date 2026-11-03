import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { GOOGLE_CLIENT_ID } from "@/configs/server";
import { useTheme } from "@/providers/Theme";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";

let configured = false;
const ensureConfigured = () => {
  if (configured) return;
  // webClientId: để Google cấp id_token có aud = web client id, backend xác minh bằng id này
  GoogleSignin.configure({ webClientId: GOOGLE_CLIENT_ID });
  configured = true;
};

const messageOf = (e: unknown) => {
  if (isErrorWithCode(e)) {
    switch (e.code) {
      case statusCodes.IN_PROGRESS:
        return "Đang đăng nhập, vui lòng chờ.";
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return "Máy chưa có Google Play Services.";
      default:
        // DEVELOPER_ERROR (10): sai package / SHA-1 của Android OAuth client
        return `Đăng nhập Google lỗi (${e.code}). Kiểm tra cấu hình client id.`;
    }
  }
  return "Đăng nhập Google không thành công.";
};

// Chỉ render khi GOOGLE_ENABLED (có EXPO_PUBLIC_GOOGLE_CLIENT_ID).
const GoogleButton = ({
  onIdToken,
  onError,
  disabled,
}: {
  onIdToken: (idToken: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}) => {
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);

  const press = async () => {
    setBusy(true);
    try {
      ensureConfigured();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Đổi tài khoản mỗi lần: không dính tài khoản cũ đã đăng nhập trước đó
      await GoogleSignin.signOut().catch(() => {});
      const res = await GoogleSignin.signIn();
      if (!isSuccessResponse(res)) return; // người dùng huỷ
      const token = res.data.idToken;
      if (!token) return onError?.("Google không trả id token. Kiểm tra web client id.");
      onIdToken(token);
    } catch (e) {
      if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) return;
      console.log("google signin error", e);
      onError?.(messageOf(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pressable
      disabled={busy || disabled}
      onPress={press}
      className="h-14 rounded-2xl flex-row items-center justify-center gap-3 border"
      style={{ borderColor: theme.subText3 }}
    >
      {busy ? (
        <ActivityIndicator color={theme.text} />
      ) : (
        <AppIcon branch="antd" name="google" size={20} color={theme.text} />
      )}
      <AppText font="MulishSemiBold">Tiếp tục với Google</AppText>
    </Pressable>
  );
};

export default GoogleButton;
