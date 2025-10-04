import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { View } from "react-native";
import { Divider } from "react-native-paper";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";

export const DiscoverDetailMenu = () => (
  <View>
    <Menu>
      <MenuTrigger>
        <AppIcon branch="feather" name="more-vertical" size={28} />
      </MenuTrigger>
      <MenuOptions
        optionsContainerStyle={{ paddingHorizontal: 4, marginTop: 36 }}
      >
        <MenuOption
          style={{ paddingVertical: 8 }}
          onSelect={() => alert(`Save`)}
        >
          <View className="flex-row gap-4 items-center">
            <AppIcon branch="feather" name="save" size={16} color="subText2" />
            <AppText>Save</AppText>
          </View>
        </MenuOption>
        <Divider />
        <MenuOption
          style={{ paddingVertical: 8 }}
          onSelect={() => alert(`Sync`)}
        >
          <View className="flex-row gap-4 items-center">
            <AppIcon branch="feather" name="save" size={16} color="subText2" />
            <AppText>Sync</AppText>
          </View>
        </MenuOption>
        <Divider />
        <MenuOption
          style={{ paddingVertical: 8 }}
          onSelect={() => alert(`Unsync`)}
        >
          <View className="flex-row gap-4 items-center">
            <AppIcon branch="feather" name="save" size={16} color="subText2" />
            <AppText>Unsync</AppText>
          </View>
        </MenuOption>
        <Divider />
        <MenuOption
          style={{ paddingVertical: 8 }}
          onSelect={() => alert(`Update Logs`)}
        >
          <View className="flex-row gap-4 items-center">
            <AppIcon branch="feather" name="save" size={16} color="subText2" />
            <AppText>Update Logs</AppText>
          </View>
        </MenuOption>
        <MenuOption
          style={{ paddingVertical: 8 }}
          onSelect={() => alert(`Update Logs`)}
        >
          <View className="flex-row gap-4 items-center">
            <AppIcon branch="feather" name="save" size={16} color="subText2" />
            <AppText>Update Request</AppText>
          </View>
        </MenuOption>
        <Divider />
        <MenuOption
          style={{ paddingVertical: 8 }}
          onSelect={() => alert(`Save`)}
        >
          <View className="flex-row gap-4 items-center">
            <AppIcon branch="feather" name="save" size={16} color="subText2" />
            <AppText>Reset</AppText>
          </View>
        </MenuOption>
        <Divider />
        <MenuOption
          style={{ paddingVertical: 8 }}
          onSelect={() => alert(`Save`)}
        >
          <View className="flex-row gap-4 items-center">
            <AppIcon branch="feather" name="save" size={16} color="subText2" />
            <AppText>Report</AppText>
          </View>
        </MenuOption>
        <Divider />
        <MenuOption
          style={{ paddingVertical: 8 }}
          onSelect={() => alert(`Delete`)}
        >
          <View className="flex-row gap-4 items-center">
            <AppIcon branch="feather" name="trash" size={16} color="error" />
            <AppText color="error">Delete</AppText>
          </View>
        </MenuOption>
        <Divider />
        <MenuOption
          style={{ paddingVertical: 8 }}
          onSelect={() => alert(`Not called`)}
          disabled={true}
          text="Disabled"
        />
      </MenuOptions>
    </Menu>
  </View>
);
