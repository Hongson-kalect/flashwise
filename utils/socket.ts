import MD5 from "crypto-js/md5";

/**
 * Tạo ID phòng socket duy nhất dựa trên nội dung tra cứu
 * @param word - Từ cần tra
 * @param language - Ngôn ngữ gốc (ví dụ: 'en')
 * @param userLanguage - Ngôn ngữ đích (ví dụ: 'vi')
 */
export const getTranslateRoomId = (
  word: string,
  language: string,
  userLanguage: string
): string => {
  // Chuẩn hóa từ (viết thường, bỏ khoảng trắng thừa) để đảm bảo MD5 nhất quán
  const normalizedWord = word.trim().toLowerCase();

  const hash = MD5(normalizedWord).toString();

  // Trả về format: md5_en_vi
  return `${hash}_${language}_${userLanguage}`;
};
