import AppButton from "@/components/AppButton";
import { AppDivider } from "@/components/AppDivider";
import AppTitle from "@/components/AppTitle";
import { useTheme } from "@/providers/Theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LayoutChangeEvent, ScrollView, View } from "react-native";
import WordCreateAdvanceForm from "./components/advanceForm";
import WordCreateBasicForm from "./components/basicForm";
import CreateHeader from "./components/header";
import WordCreateMoreForm from "./components/moreForm";
import WordInput from "./components/wordInput";

const CreateCardScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const [labelWidth, setLabelWidth] = useState(0);
  const [advanceLabelWidth, setAdvanceLabelWidth] = useState(0);

  const onLabelLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setLabelWidth((prev) => Math.max(prev, width));
  };
  const onAdvanceLabelLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setAdvanceLabelWidth((prev) => Math.max(prev, width));
  };
  return (
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <View>
        <CreateHeader />
      </View>
      <AppDivider />

      <ScrollView>
        <View className="px-2">
          <View className="mt-8">
            <WordInput />
          </View>

          {/* Cơ bản */}

          <View className="mt-4">
            <WordCreateBasicForm
              labelWidth={labelWidth}
              onLabelLayout={onLabelLayout}
            />
          </View>
          {/* Mở rộng */}
          <AppDivider style={{ marginTop: 24 }} />
          <View className="gap-2 mt-6">
            <AppTitle title="Phân loại" />
            <View className="mt-2">
              <WordCreateMoreForm
                labelWidth={labelWidth}
                onLabelLayout={onLabelLayout}
              />
            </View>
          </View>

          {/* Form link */}

          <View className="h-8"></View>

          <WordCreateAdvanceForm
            labelWidth={advanceLabelWidth}
            onLabelLayout={onAdvanceLabelLayout}
          />
        </View>
        <View className="mt-8 px-4">
          <AppButton
            title="Tạo bản dịch"
            type="primary"
            size="lg"
            onPress={() =>
              router.push("/screens/Word/Create/Translate/List/screen")
            }
          />
        </View>

        <View className="h-10"></View>
      </ScrollView>

      {/* <AppText>Từ liên quan (search- chọn)</AppText> */}
    </View>
  );
};

export default CreateCardScreen;
