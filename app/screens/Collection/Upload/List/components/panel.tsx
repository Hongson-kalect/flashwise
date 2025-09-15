import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";

const UploadPanel = () => {
  const { theme } = useTheme();
  return (
    <View className="rounded-xl p-4" style={{ backgroundColor: theme.primary }}>
      <View className="flex-row gap-6">
        <View className="w-24 h-24 rounded-full bg-white border-2 border-gray-200"></View>
        <View className="gap-1">
          <AppText color="white" font="MulishLight">
            Uploaded
          </AppText>
          <View className="flex-row items-center gap-4">
            <AppIcon
              name="upload-cloud"
              branch="feather"
              size={36}
              color="white"
            />

            <AppText color="white" size={40} font="MulishBold">
              32
            </AppText>
          </View>
        </View>
      </View>
      <View className="flex-row items-center justify-between mt-6 gap-4">
        <View className=" bg-white rounded-lg flex-1 px-2 py-1">
          <AppText size={"xs"} font="MulishLight" color="subText2">
            View
          </AppText>
          <View className="flex-row items-center justify-center mb-2 mt-1">
            <AppText size={"lg"} font="MulishBold">
              1k8
            </AppText>
          </View>
        </View>
        <View className=" bg-white rounded-lg flex-1 px-2 py-1">
          <AppText size={"xs"} font="MulishLight" color="subText2">
            Like
          </AppText>
          <View className="flex-row items-center justify-center mb-2 mt-1">
            <AppText size={"lg"} font="MulishBold" color="primary">
              1k8
            </AppText>
          </View>
        </View>
        <View className=" bg-white rounded-lg flex-1 px-2 py-1">
          <AppText size={"xs"} font="MulishLight" color="subText2">
            Download
          </AppText>
          <View className="flex-row items-center justify-center mb-2 mt-1">
            <AppText size={"lg"} font="MulishBold" color="secondary">
              1k8
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default UploadPanel;
