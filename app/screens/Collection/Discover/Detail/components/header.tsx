import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { Dispatch, SetStateAction, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, { SlideInRight, SlideOutRight } from "react-native-reanimated";

type Props = {
  mode?: "create" | "update" | "view";
  setMode: Dispatch<SetStateAction<"update" | "view">>;
};
const DiscoverDetailHeader = ({ mode, setMode }: Props) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { width } = useWindowDimensions();
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        // title="Detail"
        rightElement={
          <View className="flex-row gap-2 items-center">
            {/* {mode !== "view" && (
              <Animated.View className="">
                <AppButton type="error" title="Delete" onPress={() => {}}>
                  <AppIcon
                    name="trash"
                    branch="feather"
                    size={22}
                    color="white"
                  />
                </AppButton>
              </Animated.View>
            )} */}

            <AppButton
              onPress={() => {
                // router.push(`/screens/Word/Update/${1}`);
                // router.push("/screens/Collection/Upload/List/screen");
                alert("save");
              }}
              type={mode === "view" ? "primary" : "success"}
            >
              <AppIcon
                name={mode === "view" ? "link" : "check"}
                branch="fa6"
                size={18}
                color="white"
              />
              <AppText color="white">Save</AppText>
            </AppButton>

            <View>
              <View className="w-6 rounded-full items-center justify-center">
                <AppIcon
                  onPress={() => setMenuVisible(!menuVisible)}
                  branch="feather"
                  name="more-vertical"
                  size={28}
                  color="black"
                />
              </View>

              {menuVisible && (
                <Animated.View
                  entering={SlideInRight}
                  exiting={SlideOutRight}
                  className="h-20 w-1/2 p-3 rounded-lg bg-red-500 relative bottom-20"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 40,
                    zIndex: 100,
                    width: width / 2,
                  }}
                >
                  <View>
                    <AppText>copy id</AppText>
                    <AppText>Sync</AppText>
                    <AppText>upload</AppText>
                    <AppText>unload</AppText>
                    <AppText>Reset</AppText>
                    {/* Đưa collection về trạng thái trước khi tự chỉnh sửa */}
                    <AppText>Reset</AppText>

                    <AppText>Update logs</AppText>
                    <AppText>Update approval</AppText>
                    <AppText>Delete</AppText>
                    <AppText>Report</AppText>
                  </View>
                </Animated.View>
              )}
            </View>
          </View>
        }
      />
    </View>
  );
};

export default DiscoverDetailHeader;
