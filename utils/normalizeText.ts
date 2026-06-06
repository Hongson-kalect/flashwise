import { MD5 } from "crypto-js";

export function normalizeWord(input: string, word_lang?: string, user_lang?: string) {
  // 1. Loại bỏ khoảng trắng thừa ở 2 đầu
  // let word = input.trim();

  // // 2. Xóa các dấu câu đặc biệt ở 2 đầu (chỉ giữ lại chữ và số)
  // // Regex này tìm các ký tự không phải chữ/số ở đầu và cuối để xóa
  // word = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  const normalize = input
    .trim()                           // Cắt khoảng trắng 2 đầu
    .replace(/\s+/g, " ")             // Thu gọn nhiều khoảng trắng ở giữa thành 1 khoảng trắng
    .toLowerCase();                   // Chuyển hết thành chữ thường

  // 3. Chuẩn hóa khoảng trắng ở giữa (biến nhiều khoảng trắng thành 1)
  const hash = MD5(normalize.replace(/\s+/g, " ")).toString();

  if(!word_lang) return hash;
  if(!user_lang) return `${hash}_${word_lang.toLowerCase().trim()}`;;
  return `${hash}_${word_lang.toLowerCase().trim()}_${user_lang.toLowerCase().trim()}`;
   ;
}
