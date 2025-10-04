import { fonts } from "@/configs/fonts";
import { useTheme } from "@/providers/Theme";
import { LinearGradient, Text, useFont, vec } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { Area, CartesianChart, Line } from "victory-native";

const date = new Date("2023-01-01");
const DATA = Array.from({ length: 20 }, (_, i) => ({
  x: date.setDate(date.getDate() + 1),
  y: 40 * i + Math.floor(Math.random() * 8) * 5,
}));
const AppLineChart = () => {
  //Còn handle hover thì sẽ dựa vào daily routine chart để config
  const font = useFont(fonts.MulishRegular, 9);
  const font2 = useFont(fonts.MulishBold, 12);
  const font3 = useFont(fonts.MulishBold, 18);
  const { theme } = useTheme();
  const data = useMemo(() => [...DATA], []);
  return (
    <CartesianChart
      data={data}
      xKey="x"
      yKeys={["y"]}
      axisOptions={{
        /**
         * 👇 Pass the font object to the axisOptions.
         * This will tell CartesianChart to render axis labels.
         */
        font: font,
        labelColor: theme.subText1,
        lineColor: {
          grid: {
            y: "#e2e2e2",
            x: "transparent",
          },
          frame: "#e2e2e2",
        },
        // lineWidth:1,

        /**
         * 👇 We will also use the formatXLabel prop to format the month number
         * from a number to a month name.
         */
        formatXLabel: (value) => {
          if (value === 0) return "0";
          const date =
            (new Date(value).getMonth() + 1).toString().padStart(2, "0") +
            "/" +
            (new Date(value).getDate() + 1).toString().padStart(2, "0");
          return date;
        },
      }}
      domainPadding={{ top: 37, right: 0, bottom: 0, left: 0 }}
      domain={{ y: [0] }}
    >
      {({ points, chartBounds }) => (
        <>
          {/* //👇 pass a PointsArray to the Line component, as well as options. */}
          <Line
            points={points.y}
            curveType="natural"
            color={theme.primary}
            strokeWidth={2}
            animate={{ type: "timing", duration: 300 }}
          />
          <Area
            points={points.y}
            curveType="natural"
            color={theme.primary}
            y0={chartBounds.bottom}
            animate={{ type: "timing", duration: 300 }}
          >
            <LinearGradient
              start={vec(0, 0)} // 👈 The start and end are vectors that represent the direction of the gradient.
              end={vec(0, 200)}
              colors={[
                // 👈 The colors are an array of strings that represent the colors of the gradient.
                theme.primary + "dd",
                theme.primary + "11", // 👈 The second color is the same as the first but with an alpha value of 50%.
              ]}
            />
          </Area>

          {points.y.map((point, index) => {
            const length = points.y.length - 1;
            const showIndex = Array.from({ length: 4 }, (_, i) =>
              Math.ceil((length / 4) * (i + 1))
            );

            const uniqueShowIndex = [...new Set(showIndex)].sort(
              (a, b) => a - b
            );
            if (index === length)
              return (
                <Text
                  key={index}
                  x={point.x - data[index]?.y.toString().length * 13}
                  y={(point?.y || 0) - 4}
                  text={`${data[index]?.y}`} // data có phần tử padding ở đầu
                  font={font3}
                  color={theme.error}
                />
              );
            if (uniqueShowIndex.includes(index))
              return (
                <Text
                  key={index}
                  x={point.x - data[index]?.y.toString().length * 10}
                  y={(point?.y || 0) - 4}
                  text={`${data[index]?.y}`} // data có phần tử padding ở đầu
                  font={font2}
                  color={theme.error + "cc"}
                  // align="center"
                />
              );
          })}
        </>
      )}
    </CartesianChart>
  );
};

export default AppLineChart;
