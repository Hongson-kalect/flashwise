import { useTheme } from "@/providers/Theme";
import { TouchableOpacity, View, ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AppDivider } from "./AppDivider";
import AppText from "./AppText";

type Props = {
  onSelect: (val: string) => void;
  show?: boolean;
  itemStyle?: ViewStyle;
  options: { label: string | React.ReactNode; value: string }[];
};
const AppSuggestion = (props: Props) => {
  const { theme } = useTheme();

  if (!props.show) return null;
  return (
    <Animated.View
      entering={FadeInDown}
      className="absolute"
      style={{
        backgroundColor: theme.background,
        elevation: 4,
        shadowColor: theme.text,
        top: "100%",
        marginTop: 2,
        left: 0,
        right: 0,
        zIndex: 1,
      }}
    >
      {props.options.map(({ label, value }, index) => {
        const isLast = index === props.options.length - 1;
        return (
          <View key={index}>
            <TouchableOpacity
              style={props.itemStyle}
              onPress={() => props.onSelect(value)}
              className="px-2 h-14 flex-row items-center"
            >
              {typeof label === "string" ? <AppText>{label}</AppText> : label}
            </TouchableOpacity>
            {!isLast && <AppDivider />}
          </View>
        );
      })}
    </Animated.View>
  );
};

export default AppSuggestion;
