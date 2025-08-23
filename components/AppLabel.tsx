import { useTheme } from "@/providers/Theme";
import { useMemo } from "react";
import { Text, View } from "react-native";

type Props = {
  titles: string[];
  colors?: string[];
};
const AppLabel = ({ titles, colors }: Props) => {
  const { theme } = useTheme();
  const labelColors = useMemo(() => {
    return colors || [theme.primary, theme.secondary, theme.tertiary];
  }, [colors, theme]);
  return (
    <View className="flex-row items-center">
      {titles.map((text, index) => {
        const color = labelColors
          ? labelColors[index % labelColors.length]
          : null; // Cycle through colors if fewer colors than titles
        return (
          <Text
            key={index}
            style={{
              color: color || "#000",
              fontSize: 34,
              fontFamily: "MulishSemiBold",
            }}
          >
            {text}
          </Text>
        );
      })}
    </View>
  );
};

export default AppLabel;
