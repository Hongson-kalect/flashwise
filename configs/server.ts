// Địa chỉ backend. Đặt EXPO_PUBLIC_API_ORIGIN trong .env (vd http://192.168.1.10:8000).
// Mặc định 10.0.2.2 = máy host nhìn từ Android emulator.
export const API_ORIGIN = (
  process.env.EXPO_PUBLIC_API_ORIGIN ?? "http://10.0.2.2:8000"
).replace(/\/+$/, "");

export const API_BASE_URL = `${API_ORIGIN}/api/`;
export const WS_WORD_URL = `${API_ORIGIN.replace(/^http/, "ws")}/ws/word/`;

/** Web client id (Google Cloud Console). Để trống thì ẩn nút Google. */
export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
export const GOOGLE_ENABLED = !!GOOGLE_CLIENT_ID;
