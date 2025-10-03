import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { router } from "expo-router";
import { Dispatch, SetStateAction, useState } from "react";
import { View } from "react-native";

type Props = {
  mode?: "create" | "update" | "view";
  setMode: Dispatch<SetStateAction<"update" | "view">>;
};
const DiscoverListHeader = ({ mode, setMode }: Props) => {
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        // title="Detail"
        rightElement={
          <View className="flex-row gap-2 items-center">
            {/* {mode !== "view" && (
              <Animated.View
                className=""
                entering={SlideInUp}
                exiting={SlideOutUp}
              >
                <AppButton type="error" title="Delete" onPress={() => {}}>
                  <AppIcon
                    name="trash"
                    branch="feather"
                    size={22}
                    color="white"
                  />
                  <AppText color="white">Delete</AppText>
                </AppButton>
              </Animated.View>
            )} */}

            <AppButton
              onPress={() => {
                // router.push(`/screens/Word/Update/${1}`);
                router.push("/screens/Collection/Upload/List/screen");
              }}
              type={mode === "view" ? "primary" : "success"}
            >
              <AppIcon
                name={mode === "view" ? "link" : "check"}
                branch="fa6"
                size={18}
                color="white"
              />
              <AppText color="white">My upload</AppText>
            </AppButton>

            {/* <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              style={{
                backgroundColor: "white",
                borderRadius: 8,
                elevation: 4,
              }}
              anchorPosition="bottom"
              theme={{
                colors: {
                  primary: "#000",
                  background: "white",
                  backdrop: "white",
                  accent: "white",
                },
              }}
              anchor={
                <AppIcon
                  onPress={() => setMenuVisible(true)}
                  branch="feather"
                  name="menu"
                  size={28}
                  color="black"
                />
              }
            >
              <Menu.Item title="Delete" onPress={() => {}}></Menu.Item>
              <Menu.Item title="Delete" onPress={() => {}}></Menu.Item>
              <Menu.Item title="Delete" onPress={() => {}}></Menu.Item>
            </Menu> */}
          </View>
        }
      />
    </View>
  );
};

export default DiscoverListHeader;
