import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import { Divider } from "react-native-paper";

type Props = {};

const collocations = [
  "Set the table",
  "table data",
  "draw the table",
  "tạble tình",
  "table of contents",
];

const WordCollocations = (props: Props) => {
  const { theme } = useTheme();

  return (
    <View className="mt-2">
      <AppText size="lg" font="MulishBlack" color="primary">
        Collocations
      </AppText>
      <Divider />

      <View className="flex-row items-center justify-normal flex-wrap gap-3 mt-4">
        {collocations.map((item, index) => (
          <View
            style={{ backgroundColor: theme.disabled + 30 }}
            className="px-4 rounded-lg py-1"
            key={index}
          >
            <AppText font="MulishRegularItalic" size={"sm"} key={index}>
              {item}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

export default WordCollocations;
