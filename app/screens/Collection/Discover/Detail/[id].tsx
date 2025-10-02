import { useTheme } from "@/providers/Theme";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CollectionTags from "../../components/tags";
import CollectionWordList from "../../components/wordList";
import DiscoverDetailHeader from "./components/header";

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

      <KeyboardAwareScrollView style={{ paddingHorizontal: 12 }}>
        <View></View>
        <TextInput
          value={"Bảng Cửu Chương"}
          multiline
          readOnly
          // submitBehavior="done"
          returnKeyType="done"
          placeholder="Collection Name"
          onChangeText={(name) => {}}
          style={{
            fontSize: 32,
            fontFamily: "MulishBold",
            color: theme.primary,
            textAlign: "center",
          }}
          placeholderTextColor={"#C4C4C4"}
        />

        <View className="mt-4">
          <CollectionTags />
        </View>

        {/* <CollectionCreateOptions /> */}

        {/* Word list */}
        {/* <AppDivider style={{ marginTop: 16 }} /> */}
        <View className="mt-8">
          <CollectionWordList />
        </View>
      </KeyboardAwareScrollView>

      {/* 
        options: save + options(report | copy id) | remove | edit + options ( delete | sync | un-upload | copy id | update log | update request) | edit complete + delete | unshare + sync + edit,
        copy collection code
        update request if that is protected
        update log

        ower | contributed

        likes,
        name
        image
        tags
        description
        words


      */}
      {/* <AppButton onPress={() => {}} title="Sync" size="xl" /> */}
    </View>
  );
};

export default DiscoverDetail;
