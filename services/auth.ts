import axios from "axios";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { API_BASE_URL } from "@/configs/server";
import { useAuthStore } from "@/stores/useAuthStore";
import { uuidv7 } from "@/utils/uuidv7";

const DEVICE_ID_KEY = "deviceId";

/** UUID tự sinh 1 lần cho máy này, giữ trong SecureStore. */
export const getDeviceId = async (): Promise<string> => {
  let id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!id) {
    id = uuidv7();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  }
  return id;
};

export const getDeviceInfo = async () => ({
  device_id: await getDeviceId(),
  os: Platform.OS,
  app_version: Constants.expoConfig?.version ?? "1.0.0",
  device_name: Device.deviceName ?? Device.modelName ?? "",
});

export interface AppConfig {
  min_version: string;
  latest_version: string;
  media_base_url: string;
}

export const fetchAppConfig = async (): Promise<AppConfig> => {
  const res = await axios.get<AppConfig>(`${API_BASE_URL}app-config/`, {
    timeout: 8000,
  });
  return res.data;
};

/**
 * Đảm bảo có token. Chưa có: device-login (tạo tài khoản khách).
 * Trả về lỗi `login_required` nếu máy đã gắn tài khoản thật (phải đăng nhập lại).
 */
export const ensureSession = async (): Promise<
  "ok" | "login_required" | "offline" | "disabled"
> => {
  const store = useAuthStore.getState();
  store.initAuth();
  if (useAuthStore.getState().accessToken) return "ok";

  try {
    const res = await axios.post(
      `${API_BASE_URL}auth/device-login/`,
      await getDeviceInfo(),
      { timeout: 10000 },
    );
    await store.login(res.data.accessToken, res.data.refreshToken);
    store.setGuest(true);
    return "ok";
  } catch (e: any) {
    const code = e?.response?.data?.errorCode;
    if (code === "login_required") return "login_required";
    if (code === "account_disabled") return "disabled";
    return "offline"; // học offline vẫn chạy, thử lại sau
  }
};

/** So sánh "1.2.3" kiểu số. true nếu a < b. */
export const isVersionLower = (a: string, b: string) => {
  const pa = String(a).split(".").map(Number);
  const pb = String(b).split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d < 0;
  }
  return false;
};
