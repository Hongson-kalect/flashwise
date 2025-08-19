import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import UploadDetailHeader from "./components/header";
import { useState } from "react";

const UpdateCollectionDetail = () => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<"view" | "update">("view");
  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View>
        <UploadDetailHeader mode={mode} setMode={(mode) => setMode(mode)} />
      </View>
      <AppText>UpdateCollectionDetail</AppText>
    </View>
  );
};

export default UpdateCollectionDetail;
