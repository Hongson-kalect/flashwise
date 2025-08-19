import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { router } from "expo-router";
import { View } from "react-native";

const UploadListHeader = () => {
  return (
    <View className="flex-row justify-between items-center h-14">
      <AppReturnHeader
        title="My collections"
        rightElement={
          <AppButton
            onPress={() =>
              router.push("/screens/Collection/Upload/Create/screen")
            }
            // onPress={testFunction}
            title="Upload"
            type="primary"
          >
            <AppIcon name="upload" branch="antd" color="white" size={18} />
            <AppText color="white">Upload</AppText>
          </AppButton>
        }
      />
      {/* <AppLabel titles={["My ", "Uploads"]} /> */}
    </View>
  );
};

export default UploadListHeader;
