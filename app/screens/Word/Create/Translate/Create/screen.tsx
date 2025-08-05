import AppText from "@/components/AppText";
import { View } from "react-native";

type Props = {};

export default function TranslateCreate({}: Props) {
  return (
    <View>
      <AppText>Tạo bản dịch [nhiều]</AppText>

      <AppText>Nhập quốc gia</AppText>
      <AppText>Nhập chữ</AppText>
      <AppText>Chú thích</AppText>
      <AppText>Đồng nghĩa</AppText>
      <AppText>Trái nghĩa</AppText>
      {/* <AppText>Nhập Nghĩa</AppText> */}
      <AppText>Nhập Ví dụ</AppText>
      {/* <AppText>
        Chọn kiểu từ (Động từ, tính từ, danh từ, trạng từ, đại từ, giới từ, liên
        từ, thán từ, số từ, từ hạn định)
        </AppText> */}
      <AppText>Cách phát âm (chị google có thể đọc được)</AppText>
      <AppText>File phát âm (giới hạn dung lượng và thời gian)</AppText>
    </View>
  );
}
