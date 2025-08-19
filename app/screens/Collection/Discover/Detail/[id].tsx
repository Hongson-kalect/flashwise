import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import DiscoverDetailHeader from "./components/header";
import { useState } from "react";

const DiscoverDetail = () => {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const [mode, setMode] = useState<"view" | "update">("view");

  //Cái chi tiết upload collection này có khác so với cái collection bình thường không nhể?
  //Khi tạo thì chỉ đơn giản là upload, không có thêm bớt gì cả. Có sửa thì sửa tên, mô tả, tags,còn về word thì sẽ không thể chủ động thêm sửa
  //Nếu sửa các trường field thì sẽ thay đổi trực tiếp, còn để có thể thay đổi word thì chỉ có thể sync với collection mới được tạo và tạo thành version mới
  //Sau khi tạo thành version mới thì sẽ tạo bản mới trong db. Thêm note bản mới, sync chỉ có thay đổi về chữ hay là nhặt luôn các thông tin text field?
  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View>
        <DiscoverDetailHeader mode={mode} setMode={(mode) => setMode(mode)} />
      </View>
      <AppText>DiscoverList detail</AppText>
      <AppButton onPress={() => {}} title="Sync" size="xl" />
    </View>
  );
};

export default DiscoverDetail;
