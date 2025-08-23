import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import CardListItem from "./listItem";

const CardList = () => {
  const { theme } = useTheme();
  return (
    <View
    // style={{
    //   backgroundColor: theme.secondary,
    //   elevation: 4,
    //   shadowColor: theme.secondary,
    // }}
    // className="rounded-lg"
    >
      {/* <View
        style={{ borderBottomColor: theme.secondary, borderBottomWidth: 1 }}
        className="flex-row h-12 items-center gap-2"
      >
        <TouchableOpacity
          onPress={() => {}}
          className="w-12 h-full items-center justify-center"
        >
          <AppCheckbox onChange={() => {}} checked={false} />
        </TouchableOpacity>
        <AppText color="constract" className="flex-1 text-center" font="MulishBold">
          Word
        </AppText>
        <AppText color="constract" className="w-16 text-center" font="MulishBold">
          Type
        </AppText>
        <AppText color="constract" className="w-16 text-center" font="MulishBold">
          Level
        </AppText>
      </View> */}

      <View
        style={{ backgroundColor: theme.background }}
        className="rounded-b-lg gap-6"
      >
        {Array.from({ length: 100 }).map((_, index) => (
          <View key={index}>
            <CardListItem />
          </View>
        ))}
      </View>
    </View>
  );
};

export default CardList;
