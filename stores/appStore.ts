// src/store/appStore.ts
import {
  SystemConfigObj,
  Theme,
  UserProfile,
  UserSettingObj,
} from "@/interfaces/db.type";
import { SQLiteDatabase } from "expo-sqlite";
import { create } from "zustand";
import { createDBService } from "../database/schema";

interface AppState {
  userProfile: UserProfile | null;
  settings: UserSettingObj | null;
  configs: SystemConfigObj | null;
  themeObj: Theme | null;
  isLoadingData: boolean;
  dbService: ReturnType<typeof createDBService>|null;

  // Hàm cốt lõi để nạp dữ liệu từ local DB lên RAM Zustand
  bootstrapAppData: (db: SQLiteDatabase) => Promise<void>;

  // Các hàm cập nhật nhanh (Action)
  updateXpLocal: (additionalXp: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userProfile: null,
  settings: {},
  configs: {},
  themeObj: null,
  dbService: null,
  isLoadingData: true, // Mặc định là true để giữ màn hình Loading/Splash

  bootstrapAppData: async (db: SQLiteDatabase) => {
    const start = Date.now();
    set({ isLoadingData: true });
    try {
      const dbService = createDBService(db);

      // Chạy song song cả 3 truy vấn để tối ưu hóa tốc độ khởi động
      const [profile, settings, configs, theme] = await Promise.all([
        dbService.getUserProfile(),
        dbService.getUserSettings(),
        dbService.getSystemConfigs(),
        dbService.getActiveTheme(),
      ]);

      console.log("profile", profile);
      console.log("settings", settings);
      console.log("configs", configs);
      console.log("theme", theme);

      set({
        dbService: dbService,
        userProfile: profile,
        settings: settings,
        configs: configs,
        themeObj: theme,
        isLoadingData: false,
      });

      console.log(
        "=> [Zustand] Khởi tạo dữ liệu Local DB thành công!",
        Date.now() - start,
      );
    } catch (error) {
      console.error("=> [Zustand] Khởi tạo dữ liệu thất bại:", error);
      set({ isLoadingData: false });
    }
  },

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
