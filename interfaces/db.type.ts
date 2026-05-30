// src/types/db.types.ts

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  dob: string | null;
  country: string;
  native_language: string;
  learning_languages: string; // Bản gốc trong DB là JSON string
  level: number;
  total_xp: number;
  current_streak: number;
  max_streak: number;
  total_words_learned: number;
  total_sessions: number;
  total_app_time: number;
  tier: 'guest' | 'member' | 'premium'; // ví dụ các tier
  tier_expired_at: string | null;
  provider: string;
  identifier: string;
  display_name: string;
  time_zone: string;
  last_sync: string | null;
  version: number;
  updated_at: string;
}

export interface UserSetting {
  key: string;
  value: string; // JSON string
  version: number;
}

// type UserSettingEnum = "color"|"font"|""
export interface UserSettingObj {
  [key: string]:string;
}

export interface Theme {
  id: string;
  name: string;
  color_palette: string; // JSON string
  font: string | null;
  is_default: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}