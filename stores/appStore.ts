import { lightTheme } from "./../configs/theme";
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
  themeObj: (Theme & { color_palette: typeof lightTheme }) | null;
  isLoadingData: boolean;
  dbService: ReturnType<typeof createDBService> | null;
  displayLanguage: string;

  // Hàm cốt lõi để nạp dữ liệu từ local DB lên RAM Zustand
  bootstrapAppData: (db: SQLiteDatabase) => Promise<void>;
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
    color_palette: {
      primary: "#2563eb", // Xanh da trời chủ đạo
      secondary: "#FF7700", // Xanh phụ nhẹ hơn
      tertiary: "#BBDEFB", // Xanh phụ nhạt nhất
      title: "#0D47A1", // Màu tiêu đề đậm hơn

      success: "#4CAF50", // Màu thành công
      error: "#F44336", // Màu lỗi
      warning: "#FF9800", // Màu cảnh báo
      disabled: "#BDBDBD", // Màu vô hiệu hóa
      link: "#3F51B5", // Màu liên kết
      //   border: '#E0E0E0',       // Màu viền nhẹ
      text: "#212121", // Text chính – đen xám
      subText1: "#424242", // Text phụ cấp 1
      subText2: "#757575", // Text phụ cấp 2
      subText3: "#BDBDBD", // Text phụ cấp 3

      background: "#FFFFFF", // Nền sáng
      background2: "#f8f8f8", // Nền sáng 2
      constract: "#FFFFFF", // Màu cho nút, tương phản với nền đậm
      card: "#F5F5F5", // Màu nền thẻ
      white: "#FFFFFF",
    },
    font: null,
    priority: 0,
    is_deleted: 0,
    created_at: "",
    updated_at: "",
  },
  dbService: null,
  isLoadingData: true, // Mặc định là true để giữ màn hình Loading/Splash
  displayLanguage: "en",

  bootstrapAppData: async (db: SQLiteDatabase) => {
    const start = Date.now();
    set({ isLoadingData: true });
    try {
      let locale = Localization.getLocales()[0]?.languageCode || "en";
      const dbService = createDBService(db);

      // Chạy song song cả 3 truy vấn để tối ưu hóa tốc độ khởi động
      const [profile, settings, configs, theme] = await Promise.all([
        dbService.getUserProfile(),
        dbService.getUserSettings(),
        dbService.getSystemConfigs(),
        dbService.getActiveTheme(),
      ]);

      if (settings?.display_language) {
        locale = settings.display_language;
      }

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
        displayLanguage: locale,
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
