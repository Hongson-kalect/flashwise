import AppText from "@/components/AppText";
import { HabitPoint } from "@/database/queries/habit";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from "react-native-svg";

const H = 170;
const PAD = { left: 30, right: 10, top: 12, bottom: 24 };

const label = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;

/**
 * Biểu đồ vùng (area) mức chăm chỉ: habit 0-100% theo từng ngày. Chấm đỏ = ngày mất streak, chấm xanh = ngày khiên che nghỉ.
 * Dốc lên là học đều, dốc xuống là nghỉ không khiên che.
 */
const HabitChart = ({ series }: { series: HabitPoint[] }) => {
  const { theme } = useTheme();
  const [w, setW] = useState(0);
  if (series.length < 2) return null;

  const plotW = Math.max(1, w - PAD.left - PAD.right);
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (series.length - 1)) * plotW;
  const y = (v: number) => PAD.top + (1 - Math.min(100, Math.max(0, v)) / 100) * plotH;

  const line = series.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.habit).toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;
  const studied = series.filter((p) => p.items > 0).length;
  const ticks = [0, Math.floor((series.length - 1) / 2), series.length - 1];

  return (
    <View>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: H }}>
        {w > 0 && (
          <Svg width={w} height={H}>
            <Defs>
              <LinearGradient id="habitFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.primary} stopOpacity={0.45} />
                <Stop offset="1" stopColor={theme.primary} stopOpacity={0.03} />
              </LinearGradient>
            </Defs>
            {[0, 50, 100].map((v) => (
              <Line key={`g${v}`} x1={PAD.left} x2={w - PAD.right} y1={y(v)} y2={y(v)} stroke={theme.border} strokeWidth={1} strokeDasharray={v === 0 ? undefined : "3,4"} />
            ))}
            {[0, 50, 100].map((v) => (
              <SvgText key={`t${v}`} x={PAD.left - 6} y={y(v) + 4} fontSize={10} fill={theme.subText2} textAnchor="end">
                {v}
              </SvgText>
            ))}
            <Path d={area} fill="url(#habitFill)" />
            <Path d={line} fill="none" stroke={theme.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            {series.map((p, i) =>
              p.mark ? <Circle key={p.date} cx={x(i)} cy={y(p.habit)} r={5} fill={p.mark === "lapse" ? theme.error : theme.primary} stroke={theme.card} strokeWidth={2} /> : null,
            )}
            {ticks.map((i) => (
              <SvgText key={`x${i}`} x={x(i)} y={H - 6} fontSize={10} fill={theme.subText2} textAnchor={i === 0 ? "start" : i === series.length - 1 ? "end" : "middle"}>
                {label(series[i].date)}
              </SvgText>
            ))}
          </Svg>
        )}
      </View>
      <View className="flex-row items-center gap-4 mt-2">
        <AppText size="tiny" color="subText2">{`Học ${studied}/${series.length} ngày gần nhất`}</AppText>
        <View className="flex-row items-center gap-1">
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary }} />
          <AppText size="tiny" color="subText2">Khiên che</AppText>
        </View>
        <View className="flex-row items-center gap-1">
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.error }} />
          <AppText size="tiny" color="subText2">Mất chuỗi</AppText>
        </View>
      </View>
    </View>
  );
};

export default HabitChart;
