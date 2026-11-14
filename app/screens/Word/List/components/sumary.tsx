import AppText from "@/components/AppText";
import { WordStats } from "@/database/queries/words";
import { ProgressRing, Skeleton } from "@/ui";
import { View } from "react-native";

/** Tóm tắt gọn một dòng: vòng tiến độ + nghĩa đã học, dưới là số từ / nghĩa / chưa học. */
const ListSumary = ({ stats, loading = false }: { stats?: WordStats; loading?: boolean }) => {
  const total = stats?.senses ?? 0;
  const learned = Math.min(stats?.learned ?? 0, total);
  const pct = total ? Math.min(100, (learned / total) * 100) : 0;

  return (
    <View className="flex-row items-center gap-3 px-1">
      <ProgressRing value={pct} size={44} strokeWidth={5} color="primary">
        <AppText size="xs" weight="bold">
          {Math.round(pct)}%
        </AppText>
      </ProgressRing>
      <View className="flex-1">
        {loading ? (
          <Skeleton width={120} height={18} />
        ) : (
          <AppText weight="bold" color="title">
            {`${learned} / ${total} nghĩa đã học`}
          </AppText>
        )}
        <AppText size="xs" color="subText2">
          {`${stats?.words ?? 0} từ · ${Math.max(0, total - learned)} nghĩa chưa học`}
        </AppText>
      </View>
    </View>
  );
};

export default ListSumary;
