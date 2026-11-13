import { joinUrl } from "@/utils/joinUrl";
import { lightTheme } from "@/configs/theme";
// src/store/appStore.ts
import {
  SystemConfigObj,
  Theme,
  UserProfile,
  UserSettingObj,
} from "@/interfaces/db.type";
import * as Localization from "expo-localization";
import { SQLiteDatabase } from "expo-sqlite";
import { create } from "zustand";
import { createDBService } from "../database/schema";

interface AppState {
  userProfile: UserProfile | null;
  settings: UserSettingObj | null;
  configs: SystemConfigObj | null;
  themeObj: (Omit<Theme, "color_palette"> & { color_palette: typeof lightTheme }) | null;
  isLoadingData: boolean;
  dbService: ReturnType<typeof createDBService> | null;
  displayLanguage: string;
  /** Ghép với khoá file (ảnh, audio) server trả về; lấy từ GET app-config. */
  mediaBaseUrl: string;
  /** App thấp hơn min_version của server: bắt cập nhật. */
  forceUpdate: boolean;
  setServerConfig: (cfg: { mediaBaseUrl?: string; forceUpdate?: boolean }) => void;

  // Hàm cốt lõi để nạp dữ liệu từ local DB lên RAM Zustand
  bootstrapAppData: (db: SQLiteDatabase) => Promise<boolean>;
  updateSetting: (obj: object) => void;

  // Các hàm cập nhật nhanh (Action)
  updateXpLocal: (additionalXp: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userProfile: null,
  settings: {},
  configs: {},
  themeObj: {
    id: "",
    name: "default",
    color_palette: lightTheme,
    font: null,
    priority: 0,
    is_deleted: 0,
    created_at: "",
    updated_at: "",
  },
  dbService: null,
  isLoadingData: true, // Mặc định là true để giữ màn hình Loading/Splash
  displayLanguage: "en",
  mediaBaseUrl: "",
  forceUpdate: false,
  setServerConfig: (cfg) => set(cfg),

  bootstrapAppData: async (db: SQLiteDatabase) => {
    const start = Date.now();
    set({ isLoadingData: true });
    try {
      let locale = Localization.getLocales()[0]?.languageCode || "en";
      const dbService = createDBService(db);

      // Chạy song song các truy vấn để tối ưu hóa tốc độ khởi động. Lúc reload JS (dev) kết nối SQLite native có thể
      // đang dở tay (prepareAsync bị từ chối); lỗi này mà để rơi xuống catch thì settings = null và app tưởng chưa cài đặt, nên thử lại 1 lần.
      const load = () =>
        Promise.all([
          dbService.getUserProfile(),
          dbService.getUserSettings(),
          dbService.getSystemConfigs(),
          dbService.getActiveTheme(),
        ]);
      const [profile, settings, configs, theme] = await load().catch(async (e) => {
        console.warn("=> [Zustand] Đọc DB lỗi, thử lại:", e);
        await new Promise((r) => setTimeout(r, 400));
        return load();
      });

      if (settings?.display_language) {
        locale = settings.display_language;
      }

      // console.log("profile", profile);
      if (__DEV__) console.log("settings", settings);
      // console.log("configs", configs);
      // console.log("theme", theme);

      set({
        dbService: dbService,
        userProfile: profile,
        settings: settings,
        configs: configs,
        themeObj: theme
          ? { ...theme, color_palette: useAppStore.getState().themeObj?.color_palette ?? lightTheme }
          : useAppStore.getState().themeObj,
        isLoadingData: false,
        displayLanguage: locale,
      });

      if (__DEV__) console.log(
        "=> [Zustand] Khởi tạo dữ liệu Local DB thành công!",
        Date.now() - start,
      );

      if (!settings?.learning_language){
        return false
      }
      return true
    } catch (error) {
      console.error("=> [Zustand] Khởi tạo dữ liệu thất bại:", error);
      set({ isLoadingData: false });
      return false
    }
  },

  updateSetting: (obj: object) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...obj,
      },
    })),

  updateXpLocal: (additionalXp) =>
    set((state) => {
      if (!state.userProfile) return {};
      return {
        userProfile: {
          ...state.userProfile,
          total_xp: state.userProfile.total_xp + additionalXp,
          version: state.userProfile.version + 1, // Tăng tiến version cho Sync Engine
        },
      };
    }),
}));

/** Ghép khoá file server trả về với media_base_url (đã có http thì dùng nguyên). */
export const mediaUrl = (key?: string | null) => {
  if (!key) return undefined;
  if (/^https?:\/\//.test(key)) return key;
  return joinUrl(useAppStore.getState().mediaBaseUrl, key);
};
