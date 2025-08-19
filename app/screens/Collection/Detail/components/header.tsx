import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { Dispatch, SetStateAction } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

type Props = {
  mode?: "create" | "update" | "view";
  setMode: Dispatch<SetStateAction<"update" | "view">>;
};
const CollectionDetailHeader = ({ mode, setMode }: Props) => {
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        // title="Detail"
        rightElement={
          <View className="flex-row gap-2 items-center">
            {mode !== "view" && (
              <Animated.View
                className=""
                // entering={SlideInUp}
                // exiting={SlideOutUp}
              >
                <AppButton type="error" title="Delete" onPress={() => {}}>
                  <AppIcon
                    name="trash"
                    branch="feather"
                    size={22}
                    color="white"
                  />
                  {/* <AppText color="white">Delete</AppText> */}
                </AppButton>
              </Animated.View>
            )}

            <AppButton
              onPress={() => {
                // router.push(`/screens/Word/Update/${1}`);
                setMode((prev) => (prev === "view" ? "update" : "view"));
              }}
              type={mode === "view" ? "primary" : "success"}
            >
              <AppIcon
                name={mode === "view" ? "edit" : "check"}
                branch="fa6"
                size={18}
                color="white"
              />
              <AppText color="white">
                {mode === "view" ? "Edit" : "Done"}
              </AppText>
            </AppButton>
          </View>
        }
      />
    </View>
  );
};

export default CollectionDetailHeader;
