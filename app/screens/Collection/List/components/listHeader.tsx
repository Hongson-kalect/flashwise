import AppCheckbox from "@/components/AppCheckbox";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
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
      <Pressable
        className="flex-row gap-2"
        hitSlop={10}
        flex-row
        items-center
        gap-2
      >
        <AppIcon
          branch="feather"
          name={"filter"}
          size={20}
          color={filter ? theme["error"] : theme["disabled"]}
        />
        <AppText>200 card(s)</AppText>
      </Pressable>
      <AppIcon
        onPress={() => {
          alert("Bật cái model lên");
        }}
        branch="antd"
        name={"appstore1"}
        size={30}
        color="primary"
      />
    </View>
  );
};

type Props = {
  isSelecting: boolean;
};
const ItemListHeader = ({ isSelecting }: Props) => {
  const { theme } = useTheme();
  return <View>{isSelecting ? <Selecting /> : <ListOptions />}</View>;
};

export default ItemListHeader;
