import { InkPoint, InkStroke } from "@/modules/expo-ink-recognition";
import { useTheme } from "@/providers/Theme";
import { useMemo, useRef, useState } from "react";
import { PanResponder, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

type Props = {
  size: number;
  strokes: InkStroke[];
  onChange: (strokes: InkStroke[]) => void;
  /** Ký tự mờ làm mẫu (gợi ý). */
  ghost?: string;
  ghostOpacity?: number;
  disabled?: boolean;
  borderColor?: string;
};

const toPath = (stroke: InkStroke) => {
  if (!stroke.length) return "";
  if (stroke.length === 1) return `M${stroke[0][0]} ${stroke[0][1]} l0.1 0.1`;
  return stroke.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
};

/**
 * Ô vẽ bằng ngón tay: ghi lại từng nét (x, y, thời gian) để nhận dạng, vẽ lại bằng SVG. Có đường kẻ chữ thập mờ làm chuẩn.
 * Không giữ trạng thái nét bên trong: cha giữ `strokes` để xoá / chấm.
 */
const InkCanvas = ({ size, strokes, onChange, ghost, ghostOpacity = 0.12, disabled, borderColor }: Props) => {
  const { theme } = useTheme();
  const [live, setLive] = useState<InkStroke | null>(null);
  // PanResponder tạo 1 lần nên đọc giá trị mới nhất qua ref
  const latest = useRef({ strokes, onChange, disabled });
  latest.current = { strokes, onChange, disabled };
  const current = useRef<InkStroke>([]);
  const startedAt = useRef(0);

  const pan = useMemo(() => {
    const point = (e: any): InkPoint => [
      Math.max(0, Math.min(size, e.nativeEvent.locationX)),
      Math.max(0, Math.min(size, e.nativeEvent.locationY)),
      Date.now() - startedAt.current,
    ];
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled,
      onMoveShouldSetPanResponder: () => !latest.current.disabled,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        if (!latest.current.strokes.length) startedAt.current = Date.now();
        current.current = [point(e)];
        setLive([...current.current]);
      },
      onPanResponderMove: (e) => {
        current.current.push(point(e));
        setLive([...current.current]);
      },
      onPanResponderRelease: () => {
        const done = current.current;
        current.current = [];
        setLive(null);
        if (done.length) latest.current.onChange([...latest.current.strokes, done]);
      },
    });
  }, [size]);

  return (
    <View
      {...pan.panHandlers}
      style={{ width: size, height: size, borderRadius: 16, borderWidth: 1.5, borderColor: borderColor ?? theme.border, backgroundColor: theme.card, overflow: "hidden" }}
    >
      {!!ghost && (
        <View pointerEvents="none" style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: size * 0.72, color: theme.text, opacity: ghostOpacity }}>{ghost}</Text>
        </View>
      )}
      <Svg width={size} height={size} pointerEvents="none">
        <Path d={`M${size / 2} 0 L${size / 2} ${size} M0 ${size / 2} L${size} ${size / 2}`} stroke={theme.border} strokeWidth={1} strokeDasharray="4 4" />
        {strokes.map((s, i) => (
          <Path key={i} d={toPath(s)} stroke={theme.text} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ))}
        {live && <Path d={toPath(live)} stroke={theme.text} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
      </Svg>
    </View>
  );
};

export default InkCanvas;
