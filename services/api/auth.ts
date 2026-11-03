import { getDeviceInfo } from "../auth";
import { PostAPI } from "../axios";
import { useAuthStore } from "@/stores/useAuthStore";

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user_info?: Record<string, any>;
  is_new?: boolean;
  /** Danh tính gắn vào chính tài khoản khách: dữ liệu giữ nguyên. */
  linked?: boolean;
  /** Danh tính đã có chủ: chuyển sang tài khoản đó, app phải đẩy lại dữ liệu khách qua sync/push. */
  switched_from_guest?: boolean;
}

// Gửi kèm token khách (interceptor tự gắn) để nâng cấp tài khoản.
// x-no-auth: tránh interceptor tự refresh khi 401 invalid_credentials.
const noRefresh = { headers: { "x-no-auth": "true" } };

const post = async (url: string, body: object): Promise<LoginResult> => {
  const res = await PostAPI(
    url,
    { ...(await getDeviceInfo()), ...body },
    noRefresh,
  );
  const data = res.data as LoginResult;
  await useAuthStore.getState().login(data.accessToken, data.refreshToken);
  useAuthStore.getState().setGuest(data.user_info?.tier === "guest");
  useAuthStore.getState().setUser(data.user_info ?? null);
  return data;
};

export const emailLogin = (email: string, password: string) =>
  post("auth/email/login/", { email, password });

export const emailRegister = (email: string, password: string, full_name?: string) =>
  post("auth/email/register/", { email, password, full_name });

export const socialLogin = (
  provider: "google" | "apple",
  id_token: string,
  extra: object = {},
) => post("auth/social-login/", { provider, id_token, ...extra });

export const forgotPassword = (email: string) =>
  PostAPI("auth/password/forgot/", { email }, noRefresh);

export const resetPassword = (email: string, code: string, password: string) =>
  PostAPI("auth/password/reset/", { email, code, password }, noRefresh);

const messages: Record<string, string> = {
  invalid_credentials: "Email hoặc mật khẩu không đúng.",
  email_in_use: "Email này đã được đăng ký. Hãy đăng nhập bằng email để liên kết.",
  email_already_set: "Tài khoản này đã có email.",
  email_invalid: "Email không hợp lệ.",
  password_invalid: "Mật khẩu chưa đủ mạnh.",
  code_invalid: "Mã không đúng hoặc đã hết hạn.",
  email_not_configured: "Máy chủ chưa cấu hình gửi mail. Thử lại sau.",
  provider_not_configured: "Cách đăng nhập này chưa được bật trên máy chủ.",
  token_invalid: "Phiên đăng nhập không hợp lệ, thử lại.",
  account_disabled: "Tài khoản đã bị khoá.",
  user_banned: "Tài khoản đang bị hạn chế.",
};

/** Đổi lỗi axios thành câu tiếng Việt theo errorCode. */
export const authErrorMessage = (e: any): string => {
  const data = e?.response?.data;
  if (data?.errors?.length) return String(data.errors[0]);
  if (data?.errorCode && messages[data.errorCode]) return messages[data.errorCode];
  if (!e?.response) return "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.";
  return data?.detail ?? "Có lỗi xảy ra, thử lại sau.";
};
