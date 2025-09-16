import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import EditIcon from "@/components/icons/editIcon";
import TagItem from "@/components/TagItem";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";

const UploadForm = () => {
  const { theme } = useTheme();
  const { present } = useBottomSheet();
  const [formValue, setFormValue] = useState({
    title: "",
    description: "",
    image: "https://picsum.photos/600/600",
  });
  const openTagModal = () => {
    console.log("cek");
  };
  const handlePickCollection = () => {
    present({ render: () => <></>, title: "Pick Collection", size: "full" });
  };
  return (
    <View>
      <View className="mt-6 items-center justify-center">
        {formValue.image ? (
          <TouchableOpacity
            onPress={handlePickCollection}
            style={{
              elevation: 4,
              overflow: "hidden",
              backgroundColor: theme.background,
            }}
            className="h-40 w-40  rounded-lg"
          >
            <Image
              source={{ uri: formValue.image }}
              style={{ width: "100%", height: "100%" }}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handlePickCollection}
            style={{
              borderColor: theme.secondary,
              backgroundColor: theme.secondary + "10",
            }}
            className="h-40 w-40 border border-dashed  rounded-lg p-4"
          >
            <AppText color="subText2" size={"xs"}>
              Hình minh họa
            </AppText>
          </TouchableOpacity>
          //  </TouchableOpacity>
        )}
      </View>

      <View className="px-3 mt-6 gap-4">
        <AppInput
          required
          value={formValue.title}
          label="Tên upload"
          onChangeText={(val) => setFormValue({ ...formValue, title: val })}
        />

        <AppInput
          multiline
          numberOfLines={4}
          inputStyle={{ height: 100 }}
          value={formValue.title}
          label="Mô tả"
          onChangeText={(val) => setFormValue({ ...formValue, title: val })}
        />
        <View>
          <AppText
            // font="MulishBold"
            size={"sm"}
            color={"subText2"}
            className="mb-1"
          >
            Tags
          </AppText>
          <TouchableOpacity
            onPress={openTagModal}
            className="flex-row gap-2 items-center mt-2"
          >
            <View className="flex-row flex-1 gap-2 items-center flex-wrap">
              <TagItem>Tag 1</TagItem>
              <TagItem>Tag 1</TagItem>
              <TagItem>Tag 1</TagItem>
              <TagItem>Tag 1</TagItem>
              <TagItem>Tag 1</TagItem>
            </View>

            <EditIcon />
          </TouchableOpacity>
        </View>
        {/* <AppText>Chọn ngôn ngữ (?) có thể auto</AppText> */}

        {/* <AppText>Cài đặt password</AppText> */}
      </View>
    </View>
  );
};

export default UploadForm;
