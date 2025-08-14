import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { Dispatch, SetStateAction } from "react";
import { View } from "react-native";

type Props = {
  id: string;
  title: string;
  mode: "view" | "update" | "create";
  setMode: Dispatch<SetStateAction<"view" | "update" | "create">>;
};
const TranslateDetailHeader = ({ title, mode, setMode }: Props) => {
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        title={title}
        rightElement={
          <View className="flex-row gap-2 items-center">
            {mode !== "view" && (
              <View
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
              </View>
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

export default TranslateDetailHeader;
