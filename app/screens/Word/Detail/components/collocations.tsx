import AppAddIcon from "@/components/AppAddIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import { Divider } from "react-native-paper";

type Props = {
  list: string[];
};

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
      <AppText size="md" font="MulishBlack" color="title">
        Collocations
      </AppText>
      <Divider />

      <View className="flex-row items-center justify-normal flex-wrap gap-3 mt-4">
        {!props.list?.length ? (
          <View className="flex-row items-center justify-between w-full">
            <AppText color="subText3" font="MulishRegularItalic" size={"sm"}>
              No collocations
            </AppText>

            <AppAddIcon size="sm" />
          </View>
        ) : (
          props.list.map((item, index) => (
            <View
              style={{ backgroundColor: theme.disabled + 30 }}
              className="px-4 rounded-lg py-1"
              key={index}
            >
              <AppText font="MulishRegularItalic" size={"sm"} key={index}>
                {item}
              </AppText>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

export default WordCollocations;
