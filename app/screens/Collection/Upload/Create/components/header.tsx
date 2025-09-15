import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useState } from "react";
import { View } from "react-native";

const CreateUploadHeader = () => {
  const [submitable, setSubmitable] = useState(false);

  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        // title="Detail"
        rightElement={
          <AppButton
            onPress={() => {
              // router.push(`/screens/Word/Update/${1}`);
              // setMode((prev) => (prev === "view" ? "update" : "view"));
            }}
            disabled={!submitable}
            type={"primary"}
          >
            <AppIcon
              name={"upload-cloud"}
              branch="feather"
              size={18}
              color="white"
            />
            <AppText color="white">{"Upload"}</AppText>
          </AppButton>
        }
      />
    </View>
  );
};

export default CreateUploadHeader;
