import { FontFamily } from "@/configs/fonts";
import { Text, UITextProps } from "@/ui";

type Props = Omit<UITextProps, "font"> & {
  /** Tên font đã nạp (vd "MulishBold"). Ưu tiên dùng `weight` của kit. */
  font?: FontFamily;
};

/** Chữ chuẩn của app = Text của UI kit (token màu, thang cỡ chữ chung); `font` giữ cho code cũ. */
const AppText = (props: Props) => <Text {...props} />;

export default AppText;
