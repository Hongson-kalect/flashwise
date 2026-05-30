// src/store/appStore.ts
import { create } from 'zustand';
import { SQLiteDatabase } from 'expo-sqlite';
import { createDBService } from '../database/schema';
import { Theme, UserProfile, UserSettingObj } from '@/interfaces/db.type';

interface AppState {
  userProfile: UserProfile | null;
  settings: UserSettingObj|null;
  theme: Theme | null;
  isLoadingData: boolean;
  
  // Hàm cốt lõi để nạp dữ liệu từ local DB lên RAM Zustand
  bootstrapAppData: (db: SQLiteDatabase) => Promise<void>;
  
  // Các hàm cập nhật nhanh (Action)
  updateXpLocal: (additionalXp: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userProfile: null,
  settings: {},
  theme: null,
  isLoadingData: true, // Mặc định là true để giữ màn hình Loading/Splash

  bootstrapAppData: async (db: SQLiteDatabase) => {
    set({ isLoadingData: true });
    try {
      const dbService = createDBService(db);

      // Chạy song song cả 3 truy vấn để tối ưu hóa tốc độ khởi động
      const [profile, settings, theme] = await Promise.all([
        dbService.getUserProfile(),
        dbService.getUserSettings(),
        dbService.getActiveTheme(),
      ]);

      set({
        userProfile: profile,
        settings: settings,
        theme: theme,
        isLoadingData: false,
      });
      
      console.log('=> [Zustand] Khởi tạo dữ liệu Local DB thành công!');
    } catch (error) {
      console.error('=> [Zustand] Khởi tạo dữ liệu thất bại:', error);
      set({ isLoadingData: false });
    }
  },

  updateXpLocal: (additionalXp) => set((state) => {
    if (!state.userProfile) return {};
    return {
      userProfile: {
        ...state.userProfile,
        total_xp: state.userProfile.total_xp + additionalXp,
        version: state.userProfile.version + 1, // Tăng tiến version cho Sync Engine
      }
    };
  }),
}));