import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";

const CollectionItem = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        elevation: 4,
        shadowOffset: {
          width: 3,
          height: 3,
        },
        shadowColor: theme.primary,
        borderTopWidth: 0.5,
        borderLeftWidth: 0.5,
        borderRightWidth: 0.5,
        borderBottomWidth: 0.5,
        borderTopColor: theme.primary + "44",
        borderLeftColor: theme.primary + "44",
        borderRightColor: theme.primary,
        borderBottomColor: theme.primary,
      }}
      className="bg-white rounded-lg p-2"
    >
      <AppText>CollectionItema a a a a a a a a a â â a a a a</AppText>
      <AppText>CollectionItema </AppText>
      <AppText>CollectionItema </AppText>
      <AppText>CollectionItema </AppText>
      <AppText>CollectionItema </AppText>

      <View></View>
    </View>
  );
};

export default CollectionItem;
