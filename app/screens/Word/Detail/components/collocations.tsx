import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import { useAddItems } from "../addItems";
import SectionHeader from "./sectionHeader";

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
  const { open, canAdd } = useAddItems();
  const add = canAdd ? () => open("collocations") : undefined;

  return (
    <View>
      <SectionHeader
        icon={<AppIcon branch="fa6" name="quote-left" size={14} color="title" />}
        title="Collocations"
        onAdd={add}
      />

      <View className="flex-row items-center flex-wrap gap-2 mt-2">
        {!props.list?.length ? (
          <AppText color="subText3" font="MulishRegularItalic" size={"sm"}>
            Chưa có.
          </AppText>
        ) : (
          props.list.map((item, index) => (
            <View
              style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
              className="px-3 rounded-lg py-1.5"
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
