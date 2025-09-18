import { CartesianChart, Line } from "victory-native";

const DATA = Array.from({ length: 50 }, (_, i) => ({
  x: i + 1,
  y: 20 + i * 20,
}));

export function HomeLineChart() {
  return (
    <CartesianChart
      padding={{ bottom: 0, top: 10, right: 0, left: 0 }}
      data={DATA}
      xKey="x"
      yKeys={["y"]}
    >
      {({ points }) => (
        //👇 pass a PointsArray to the Line component, as well as options.
        <Line
          points={points.y}
          color="red"
          strokeWidth={3}
          animate={{ type: "timing", duration: 300 }}
        />
      )}
    </CartesianChart>
  );
}
