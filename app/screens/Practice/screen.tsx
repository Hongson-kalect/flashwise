import { useTheme } from "@/providers/Theme";
import { StyleSheet, Text, View } from "react-native";
const cc = [
  "Học từ mới: Hiện full, trừ nghĩa, người dùng bấm vào để hiển thị nghĩa (Đoán nghĩa), sau đó gõ lại nội dung gốc",
  "Lượt 2: Hiện full, trừ từ gốc, người dùng gõ từ gốc",
  "Lượt 3: Phát âm thanh, người dùng gõ từ",
  "Lượt 4: Hiện mic, người dùng phát âm từ",
  "Lượt 5: Lặp lại lượt 2, không hiện bản dịch",
];

const other = [
  "Nhìn hình đoán từ: (Chỉ áp dụng cho từ có hình) Hiển thị hình và gõ từ hoặc chọn abcd",
  "Hiện bản dịch: Chọn or nhập or đọc từ gốc",
  "Điền từ vào chỗ trống trong ví dụ",
  "Nối từ và nghĩa, nếu có full ảnh thì nối từ với ảnh",
  "Siêu tốc: hiển thị từ gốc, chọn bản dịch. Hiện bản dịch, chọn từ gốc... Túm lại là lặp đi lặp lại 1 phương pháp, trừ nghe",
  "Câu hỏi đố với từ đó, dạng abcd, các dạng như bài tiếng anh cơ bản: Chọn từ sai trong câu, dạng đúng của từ, trọng âm, sắp xếp thứ tự từ",
];

const methods = {
  newWord: {
    1: "Hiển thị từ, nghĩa, ví dụ theo ngôn ngữ dựa vào cài đặt của người dùng",
    2: "Hiển thị từ và chỉ cần nhấn next?",
  },
  input: {
    // Thứ chương trình đưa ra cho người dùng
    1: "Hiển thị từ gốc, nghĩa, hình ảnh, định nghĩa, ví dụ",
    2: "Hiển thị hình ảnh, định nghĩa, ví dụ (lược bỏ từ gốc)",
    3: "Hiển thị hình ảnh | Định nghĩa",
    4: "Hiển thị từ gốc",
    5: "Hiển thị bản dịch của từ đó",
    6: "Phát âm thanh phát âm của từ đó",
    7: "Phát âm thanh định nghĩa của từ đó",
    8: "Hiển thị hình cái mic và từ gốc",
  },
  output: {
    // cách người dùng cần làm để trả lời
    1: {
      1: "Viết lại từ đó",
    },
    2: {
      1: "Viết lại từ đó",
      2: "Chọn hình ảnh",
      3: "Chọn từ đúng",
    },
    3: {
      1: "Viết lại từ đó",
      2: "Chọn hình ảnh",
      3: "Chọn từ đúng",
    },
    4: {
      1: "Chọn bản dịch",
      2: "Phát âm từ",
    },
    5: {
      1: "Chọn từ gốc",
      2: "Ghi lại từ gốc",
    },
  },
};
export default function PracticePage() {
  const { theme } = useTheme();
  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <Text>PracticePage</Text>
      {/* Header */}
      {/* Card */}
      {/* Learning method */}
    </View>
  );
}

const styles = StyleSheet.create({});
