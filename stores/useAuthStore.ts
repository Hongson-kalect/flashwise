import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  /** Tài khoản khách (device-login), chưa gắn email / Google / Apple. */
  isGuest: boolean;
  /** user_info từ lần đăng nhập gần nhất (tên, avatar, tier...). */
  user: Record<string, any> | null;
  setUser: (u: Record<string, any> | null) => void;
  initAuth: () => void;
  setGuest: (isGuest: boolean) => void;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isGuest: false,
  user: null,
  setUser: (user) => set({ user }),

  initAuth: () => {
    const token = SecureStore.getItem("accessToken");
    if (token) set({ accessToken: token, isAuthenticated: true });
  },

  setGuest: (isGuest) => set({ isGuest }),

  login: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
    set({ accessToken, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    set({ accessToken: null, isAuthenticated: false });
  },
}));
