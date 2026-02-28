export function normalizeWord(input: string) {
  // 1. Loại bỏ khoảng trắng thừa ở 2 đầu
  let word = input.trim();

  // 2. Xóa các dấu câu đặc biệt ở 2 đầu (chỉ giữ lại chữ và số)
  // Regex này tìm các ký tự không phải chữ/số ở đầu và cuối để xóa
  word = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

  // 3. Chuẩn hóa khoảng trắng ở giữa (biến nhiều khoảng trắng thành 1)
  word = word.replace(/\s+/g, " ");

  return word.toLowerCase();
}
