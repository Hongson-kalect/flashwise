export const testData = [
  {
    id: 1,
    word: "run",
    type: "verb",
    translation: "chạy",
    translation_definition: "di chuyển nhanh bằng chân",
    translation_example: "Tôi chạy mỗi sáng để giữ sức khỏe.",
    other_translations: ["vận hành", "chạy trốn", "điều hành"],
    language: "English",
    example: "She runs every morning.",
    meaning: "to move swiftly on foot",
    image: "https://picsum.photos/900/1700",
    sound: "https://example.com/sounds/run.mp3",
    translation_sound: "https://example.com/sounds/chay.mp3",
    homophones: ["rung"],
    synonyms: ["sprint", "jog"],
    antonyms: ["walk", "stand"],
    variants: ["ran", "running"],
    spelling: "r-u-n",
    spelling_sound: "https://example.com/spell/run.mp3",
    note: "Thường dùng trong ngữ cảnh thể thao hoặc hành động nhanh.",
    created_by: "hong",
    is_changed: false,
    rating: 5,
    user: "hong",
    description: "Từ cơ bản, thường gặp trong giao tiếp hàng ngày.",
  },
  {
    id: 2,
    word: "book",
    type: "noun",
    translation: "sách",
    translation_definition:
      "tập hợp các trang giấy chứa thông tin hoặc câu chuyện",
    translation_example: "Tôi đang đọc một cuốn sách về lịch sử Việt Nam.",
    other_translations: ["đặt trước", "sổ ghi chép"],
    language: "English",
    example: "He borrowed a book from the library.",
    meaning: "a set of written or printed pages bound together",
    image: "https://picsum.photos/1000/1600",
    sound: "https://example.com/sounds/book.mp3",
    translation_sound: "https://example.com/sounds/sach.mp3",
    homophones: ["buck"],
    synonyms: ["volume", "publication"],
    antonyms: ["ebook"],
    variants: ["books", "booked"],
    spelling: "b-o-o-k",
    spelling_sound: "https://example.com/spell/book.mp3",
    note: "Có thể là danh từ hoặc động từ tùy ngữ cảnh.",
    created_by: "hong",
    is_changed: false,
    rating: 5,
    user: "hong",
    description: "Từ phổ biến trong học tập và đời sống.",
  },
  {
    id: 3,
    word: "happy",
    type: "adjective",
    translation: "vui vẻ",
    translation_definition: "cảm giác tích cực, hài lòng hoặc hạnh phúc",
    translation_example: "Tôi cảm thấy rất vui vẻ khi gặp lại bạn.",
    other_translations: ["hạnh phúc", "phấn khởi"],
    language: "English",
    example: "She looks happy today.",
    meaning: "feeling or showing pleasure or contentment",
    image: "https://picsum.photos/900/1800",
    sound: "https://example.com/sounds/happy.mp3",
    translation_sound: "https://example.com/sounds/vui.mp3",
    homophones: ["happi"],
    synonyms: ["joyful", "cheerful"],
    antonyms: ["sad", "unhappy"],
    variants: ["happier", "happiest"],
    spelling: "h-a-p-p-y",
    spelling_sound: "https://example.com/spell/happy.mp3",
    note: "Thường dùng để mô tả trạng thái cảm xúc.",
    created_by: "hong",
    is_changed: false,
    rating: 5,
    user: "hong",
    description: "Từ cảm xúc cơ bản, dễ hiểu và thường dùng.",
  },
  {
    id: 4,
    word: "build",
    type: "verb",
    translation: "xây dựng",
    translation_definition: "tạo ra một cấu trúc hoặc hệ thống",
    translation_example: "Họ đang xây dựng một cây cầu mới.",
    other_translations: ["lắp ráp", "thiết lập"],
    language: "English",
    example: "They plan to build a new school.",
    meaning: "to construct something by putting parts together",
    image: "https://picsum.photos/900/1600",
    sound: "https://example.com/sounds/build.mp3",
    translation_sound: "https://example.com/sounds/xaydung.mp3",
    homophones: ["billed"],
    synonyms: ["construct", "create"],
    antonyms: ["destroy", "demolish"],
    variants: ["built", "building"],
    spelling: "b-u-i-l-d",
    spelling_sound: "https://example.com/spell/build.mp3",
    note: "Dùng trong ngữ cảnh công trình hoặc phát triển hệ thống.",
    created_by: "hong",
    is_changed: false,
    rating: 5,
    user: "hong",
    description: "Từ thường dùng trong kỹ thuật và phát triển.",
  },
  {
    id: 5,
    word: "light",
    type: "noun / adjective",
    translation: "ánh sáng / nhẹ",
    translation_definition:
      "ánh sáng là năng lượng nhìn thấy; nhẹ là ít trọng lượng",
    translation_example: "Ánh sáng từ mặt trời rất mạnh vào buổi trưa.",
    other_translations: ["đèn", "sáng", "nhẹ nhàng"],
    language: "English",
    example: "The room was filled with light.",
    meaning: "natural or artificial illumination",
    image: "https://picsum.photos/1100/1600",
    sound: "https://example.com/sounds/light.mp3",
    translation_sound: "https://example.com/sounds/anhsang.mp3",
    homophones: ["lite"],
    synonyms: ["illumination", "brightness"],
    antonyms: ["dark", "heavy"],
    variants: ["lighter", "lightest"],
    spelling: "l-i-g-h-t",
    spelling_sound: "https://example.com/spell/light.mp3",
    note: "Từ đa nghĩa, cần xem ngữ cảnh để dịch đúng.",
    created_by: "hong",
    is_changed: false,
    rating: 5,
    user: "hong",
    description: "Từ đa dụng, xuất hiện trong nhiều lĩnh vực.",
  },
];

export type QuestionType = {
  id: number;
  word: string;
  type: string;
  translation: string;
  translation_definition: string;
  translation_example: string;
  other_translations: string[];
  language: string;
  example: string;
  meaning: string;
  image: string;
  sound: string;
  translation_sound: string;
  homophones: string[];
  synonyms: string[];
  antonyms: string[];
  variants: string[];
  spelling: string;
  spelling_sound: string;
  note: string;
  created_by: string;
  is_changed: boolean;
  rating: number;
  user: string;
  description: string;
};
