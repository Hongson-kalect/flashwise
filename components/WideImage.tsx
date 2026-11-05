import AppImage from "@/components/AppImage";
import { useTheme } from "@/providers/Theme";
import { ReactNode, useEffect, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

type Props = {
  uri: string | null;
  /** Tỉ lệ khung (rộng / cao), mặc định 16:9. */
  aspect?: number;
  /** Chiều cao cố định thay cho `aspect` (khi đó rộng theo cha). */
  height?: number;
  radius?: number;
  blur?: number;
  style?: StyleProp<ViewStyle>;
  /** Hiện khi chưa có ảnh (chữ cái đầu, biểu tượng...). */
  fallback?: ReactNode;
};

/**
 * Khung ảnh 16:9 dùng chung (ảnh nghĩa lúc học, ảnh bìa bộ...): nền là chính ảnh đó phủ kín và làm mờ,
 * ảnh thật nằm giữa. Đọc kích thước ảnh khi tải xong, tỉ lệ ảnh giữa kẹp trong [1:1, tỉ lệ khung]:
 * ảnh dọc thành vuông (cắt từ trên xuống), ảnh ngang giữ nguyên, ảnh 16:9 lấp đủ khung (hết nền mờ).
 */
const WideImage = ({ uri, aspect = 16 / 9, height, radius = 16, blur = 15, style, fallback }: Props) => {
  const { theme } = useTheme();
  const [ratio, setRatio] = useState(1);
  useEffect(() => setRatio(1), [uri]);

  return (
    <View
      style={[
        height ? { height, width: "100%" } : { aspectRatio: aspect, width: "100%" },
        { borderRadius: radius, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: theme.primary + "14" },
        style,
      ]}
    >
      {uri ? (
        <>
          <AppImage source={{ uri }} style={{ position: "absolute", width: "100%", height: "100%" }} contentFit="cover" blurRadius={blur} transition={0} />
          <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: theme.background2 + "55" }} />
          <AppImage
            source={{ uri }}
            style={{ height: "100%", aspectRatio: Math.min(Math.max(ratio, 1), aspect) }}
            contentFit="cover"
            contentPosition="top"
            onLoad={(e) => e.source.width && e.source.height && setRatio(e.source.width / e.source.height)}
          />
        </>
      ) : (
        fallback
      )}
    </View>
  );
};

export default WideImage;
