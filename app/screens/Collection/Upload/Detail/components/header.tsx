import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { router } from "expo-router";
import { Dispatch, SetStateAction } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

type Props = {
  mode?: "create" | "update" | "view";
  setMode: Dispatch<SetStateAction<"update" | "view">>;
};
const UploadDetailHeader = ({ mode, setMode }: Props) => {
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        // title="Detail"
        rightElement={
          <View className="flex-row gap-2 items-center">
            {mode !== "view" && (
              <Animated.View className="">
                <AppButton type="error" title="Delete" onPress={() => {}}>
                  <AppIcon
                    name="refresh-ccw"
                    branch="feather"
                    size={22}
                    color="white"
                  />
                </AppButton>
              </Animated.View>
            )}

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
              <AppText color="white">Edit</AppText>
            </AppButton>
          </View>
        }
      />
    </View>
  );
};

export default UploadDetailHeader;
