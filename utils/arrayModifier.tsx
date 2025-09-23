export function reorderArrayWithWeight<T>(array: T[], number?: number): T[] {
  // Copy mảng đầu vào để tránh thay đổi mảng gốc
  const arrCopy = [...array];
  const sortNumber = number || array.length;

  // Xác định số phần tử cần xáo trộn (không vượt quá độ dài mảng)
  const n = Math.min(sortNumber, arrCopy.length);

  // Lấy n phần tử đầu để xáo trộn
  const shuffledPart = arrCopy.slice(0, n);

  // Xáo trộn ngẫu nhiên (Fisher-Yates)
  for (let i = shuffledPart.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPart[i], shuffledPart[j]] = [shuffledPart[j], shuffledPart[i]];
  }

  // Ghép lại với phần còn lại không bị thay đổi
  return [...shuffledPart, ...arrCopy.slice(n)];
}
