import { Skeleton, SkeletonCircle, SkeletonText } from "@/ui";
import { View } from "react-native";

/** Khung chờ cho 1 nghĩa: phiên âm, bản dịch, ảnh, định nghĩa, ví dụ (cùng bố cục với nội dung thật). */
const SenseSkeleton = () => (
  <View className="px-1">
    <View className="flex-row items-center gap-3">
      <SkeletonCircle size={44} />
      <Skeleton width={110} height={18} />
    </View>
    <View className="flex-row gap-2 mt-5">
      <Skeleton width={84} height={28} radius={14} />
      <Skeleton width={64} height={28} radius={14} />
      <Skeleton width={96} height={28} radius={14} />
    </View>
    <Skeleton height={190} radius={16} style={{ marginTop: 16 }} />
    <View className="mt-6 gap-2">
      <Skeleton width={110} height={18} />
      <SkeletonText lines={2} />
    </View>
    <View className="mt-6 gap-2">
      <Skeleton width={90} height={18} />
      <Skeleton height={48} radius={10} />
      <Skeleton height={48} radius={10} />
    </View>
  </View>
);

export default SenseSkeleton;
