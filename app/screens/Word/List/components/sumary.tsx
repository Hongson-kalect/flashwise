import AppCard from "@/components/AppCard";
import AppText from "@/components/AppText";
import { WordStats } from "@/database/queries/words";
import { ProgressRing, Skeleton } from "@/ui";
import { View } from "react-native";

const Stat = ({ value, label }: { value: number | string; label: string }) => (
  <View className="flex-1">
    <AppText size="xl" weight="bold" color="title">
      {value}
    </AppText>
    <AppText size="xs" color="subText2">
      {label}
    </AppText>
  </View>
);

/** Thẻ tổng quan: tiến độ học (vòng) + số từ / số nghĩa / đã học. */
const ListSumary = ({ stats, loading = false }: { stats?: WordStats; loading?: boolean }) => {
  const total = stats?.senses ?? 0;
  const learned = stats?.learned ?? 0;
  const pct = total ? Math.min(100, (learned / total) * 100) : 0;

  return (
    <AppCard>
      <View className="flex-row items-center gap-5">
        <ProgressRing value={pct} size={84} strokeWidth={9} color="primary">
          <AppText size="lg" weight="bold">
            {Math.round(pct)}%
          </AppText>
        </ProgressRing>
        <View className="flex-1">
          <AppText size="sm" color="subText2">
            Đã học
          </AppText>
          {loading ? (
            <Skeleton width={90} height={28} />
          ) : (
            <AppText size="2xl" weight="bold">
              {learned}
              <AppText size="md" color="subText2">{` / ${total} nghĩa`}</AppText>
            </AppText>
          )}
        </View>
      </View>
      <View className="flex-row mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: "#94A3B833" }}>
        <Stat value={stats?.words ?? 0} label="Từ" />
        <Stat value={total} label="Nghĩa" />
        <Stat value={Math.max(0, total - learned)} label="Chưa học" />
      </View>
    </AppCard>
  );
};

export default ListSumary;
