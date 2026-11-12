/** Ngôn ngữ chọn được khi thiết lập (màn Start) và ở Cá nhân → Ngôn ngữ. */
export type Lang = { code: string; language: string };

export const learningLanguages: Lang[] = [
  { code: "en", language: "English" },
  { code: "vi", language: "Tiếng Việt · Vietnamese" },
  { code: "ja", language: "日本語 · Japanese" },
  { code: "ko", language: "한국어 · Korean" },
  { code: "zh", language: "中文 · Chinese" },
  { code: "fr", language: "Français · French" },
  { code: "de", language: "Deutsch · German" },
  { code: "es", language: "Español · Spanish" },
  { code: "it", language: "Italiano · Italian" },
  { code: "pt-BR", language: "Português (BR)" },
  { code: "ru", language: "Русский · Russian" },
  { code: "hi", language: "हिन्दी · Hindi" },
  { code: "ar", language: "العربية · Arabic" },
  { code: "tr", language: "Türkçe · Turkish" },
];

export const motherLanguages: Lang[] = [
  { code: "vi", language: "Tiếng Việt" },
  { code: "en", language: "English" },
  { code: "zh", language: "中文 · Chinese" },
  { code: "ja", language: "日本語 · Japanese" },
  { code: "ko", language: "한국어 · Korean" },
  { code: "es", language: "Español" },
  { code: "fr", language: "Français" },
  { code: "de", language: "Deutsch" },
  { code: "it", language: "Italiano" },
  { code: "pt", language: "Português" },
  { code: "ru", language: "Русский" },
  { code: "hi", language: "हिन्दी" },
  { code: "bn", language: "বাংলা" },
  { code: "ar", language: "العربية" },
  { code: "tr", language: "Türkçe" },
  { code: "nl", language: "Nederlands" },
  { code: "sv", language: "Svenska" },
  { code: "th", language: "ไทย" },
  { code: "pl", language: "Polski" },
  { code: "uk", language: "Українська" },
];
