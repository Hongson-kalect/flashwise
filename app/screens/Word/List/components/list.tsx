import { AppDivider } from "@/components/AppDivider";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import CardListItem from "./listItem";

const CardList = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.secondary,
        elevation: 4,
        shadowColor: theme.secondary,
      }}
      className="rounded-lg"
    >
      <View
        style={{ borderBottomColor: theme.secondary, borderBottomWidth: 1 }}
        className="flex-row h-12 items-center gap-2"
      >
        <View className="w-8 text-center">
          {/* <AppCheckbox onChange={() => {}} checked={true} /> */}
        </View>
        <AppText color="constract" className="flex-1 text-center" weight="bold">
          Word
        </AppText>
        <AppText color="constract" className="w-16 text-center" weight="bold">
          Level
        </AppText>
        <AppText color="constract" className="w-16 text-center" weight="bold">
          Type
        </AppText>
        {/* <AppText className="w-12 text-center">Nation</AppText> */}

        <View className="w-24 items-center">
          {/* Collection nêm */}
          <AppIcon branch="mui" name={"folder"} size={24} color="white" />
        </View>
      </View>

      <View
        style={{ backgroundColor: theme.background }}
        className="rounded-b-lg overflow-hidden"
      >
        {Array.from({ length: 50 }).map((_, index) => (
          <View key={index}>
            <CardListItem />
            {index !== 9 && <AppDivider />}
          </View>
        ))}
      </View>
    </View>
  );
};

export default CardList;
