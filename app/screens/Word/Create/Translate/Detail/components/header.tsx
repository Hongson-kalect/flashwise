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
          <AppButton
            onPress={() => {
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
            <AppText color="white">{mode === "view" ? "Edit" : "Done"}</AppText>
          </AppButton>
        }
      />
    </View>
  );
};

export default TranslateDetailHeader;
