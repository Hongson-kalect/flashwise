import { Image as ExpoImage, ImageProps } from "expo-image";
import { cssInterop } from "nativewind";

// Cho phép dùng className (NativeWind) như <Image> của React Native.
cssInterop(ExpoImage, { className: "style" });

/**
 * Ảnh dùng chung: expo-image cache RAM + đĩa, giải mã theo kích thước hiển thị,
 * fade-in nhẹ. Mặc định cover; ảnh icon/logo truyền contentFit="contain".
 */
const AppImage = ({
  contentFit = "cover",
  transition = 150,
  cachePolicy = "memory-disk",
  ...props
}: ImageProps & { className?: string }) => (
  <ExpoImage
    contentFit={contentFit}
    transition={transition}
    cachePolicy={cachePolicy}
    {...props}
  />
);

export default AppImage;
