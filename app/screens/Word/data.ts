// Kiểu dữ liệu nghĩa của từ (dùng ở trang chi tiết từ). Dữ liệu giả cũ đã bỏ.
export type SenseContentType = {
  [lang: string]: {
    id: string;
    subId: string;
    value: string;
    ruby?: string;
    roman?: string;
  };
};

export type SenseConcept = {
  id: string;
  label: string;
  status: "anchored" | "provisional" | "lexical_gap";
  equivalents: { id: string; word_id: string; word: string; language_code: string; pos?: string | null }[];
};

export type SenseType = {
  id: string;
  value?: string;
  pos?: string;
  languageCode?: string;
  contents?: {
    translations: { [lang: string]: string[] };
    definition: SenseContentType;
    usage: SenseContentType;
    examples: SenseContentType[];
    image?: string;
  };
  image_preview?: string;
  /** Server nối nghĩa này vào concept: các nghĩa giống hệt ở ngôn ngữ khác. null / thiếu = chưa nối. */
  concept?: SenseConcept | null;
  score?: number;
  /** Admin / seeder đề xuất nghĩa này (server). */
  recommended?: boolean;
  /** Nghĩa chính do chính người dùng đặt (server chỉ gắn cho người đang đăng nhập). */
  is_main?: boolean;
  isUser?: boolean;

  ipas?: {
    value: string;
    /** Phiên âm Latin (ja / zh / ko), server sinh. */
    roman?: string;
    type: string;
    url: string;
    label: string;
  }[];
  metadata?: {
    id?: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_deleted: boolean;
    is_active: boolean;
    created_by: string | null;
    updated_by: string | null;
    image_link: string | null;
    advanced: {
      collocations?: string[];
      idioms?: string[];
      forms?: string[];
      relateds?: string[];
      synonyms?: string[];
      antonyms?: string[];
    };
    tags: string[];
    image_keywords: string[];
    image_metadata: { [key: string]: string };
  };
};

export type WordInfoType = {
  id: string;
  pos: string;
  ipas: {
    tags: null;
    value: string;
  }[];
  audios: {
    url: (
      | {
          mp3Url: string;
          oggUrl?: undefined;
        }
      | {
          oggUrl: string;
          mp3Url?: undefined;
        }
    )[];
    tags: null;
    text: null;
    audio: string;
  }[];
  images: never[];
};
