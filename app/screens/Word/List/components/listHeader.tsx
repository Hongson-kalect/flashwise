import AppCheckbox from "@/components/AppCheckbox";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import AppSearch from "@/components/input/AppSearch";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { Pressable, View } from "react-native";

const Selecting = () => {
  return (
    <View className="flex-row items-center justify-between">
      <View flex-row items-center gap-2>
        <AppCheckbox
          checked={true}
          onChange={() => {}}
          customLabel={<AppText color="subText2">100 out of 200 cards</AppText>}
        />
        {/* <AppText size={"sm"}>100 out of 200 cards</AppText> */}
      </View>
      <Pressable
        onPress={() => {
          alert("Bật cái model lên");
        }}
        hitSlop={10}
        className="bg-blue-200 items-center justify-center"
        // style={{ height: , width: 48 }}
      >
        <AppIcon branch="mui" name={"delete"} size={32} color="#ff0000" />
      </Pressable>
    </View>
  );
};

const ListOptions = () => {
  const [filter, setFilter] = useState(1);
  const { theme } = useTheme();
  return (
    <View className="flex-row items-center justify-between">
      <AppText size={"sm"}>200 card(s)</AppText>

      <AppText color="subText2" size={"sm"}>
        Sắp xếp:{" "}
        <AppText
          size={"sm"}
          style={{ textDecorationLine: "underline" }}
          color="link"
          font="MulishMediumItalic"
        >
          Chữ cái
        </AppText>
      </AppText>
    </View>
  );
};

type Props = {
  isSelecting: boolean;
};
const ItemListHeader = ({ isSelecting }: Props) => {
  const { theme } = useTheme();
  return (
    <View>
      <AppTitle title="Word List" />
      <View className="">
        <View className="flex-row items-center h-16">
          <View
            style={{ backgroundColor: theme.primary + "20" }}
            className="px-2 py-1 rounded-lg"
          >
            <AppText color="subText1" size={"xs"}>
              Tag 1
            </AppText>
          </View>
        </View>
        <AppSearch />
        <View className="mt-6">
          {isSelecting ? <Selecting /> : <ListOptions />}
        </View>
      </View>
    </View>
  );
};

export default ItemListHeader;
