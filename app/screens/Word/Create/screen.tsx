import AppButton from "@/components/AppButton";
import { AppDivider } from "@/components/AppDivider";
import AppTitle from "@/components/AppTitle";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LayoutChangeEvent, ScrollView, View } from "react-native";
import WordCreateAdvanceForm from "./components/advanceForm";
import WordCreateBasicForm from "./components/basicForm";
import CreateHeader from "./components/header";
import WordCreateMoreForm from "./components/moreForm";
import WordInput from "./components/wordInput";
import WordSelectForm from "./components/wordSelectForm";

export type CreateWordInputModalProps = {
  title: string;
  field: string;
  type?: "prompt" | "input";
};

export type CreateWordRadioModalProps = {
  title: string;
  field: string;
  type?: "checkbox" | "radio";
  options: { label: string; value: string | number }[];
};

export const bottomSheetTitle = {
  related: "Từ liên quan",
  synonym: "Từ đồng nghĩa",
  antonym: "Từ trái nghĩa",
};

const CreateCardScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { present } = useBottomSheet();

  const [labelWidth, setLabelWidth] = useState(0);
  const { setGlobalModal, setListModal } = useModalStore();

  const openInputModal = ({
    title,
    field,
    type = "input",
  }: CreateWordInputModalProps) => {
    setGlobalModal({
      type: type,
      title: title,
    });
  };

  const openRadioModal = ({
    title,
    field,
    options,
  }: CreateWordRadioModalProps) => {
    setListModal({
      onSubmit: () => {},
      options,
      title,

      value: "1",
    });
  };

  const openWordSelectForm = ({
    type,
  }: {
    type: keyof typeof bottomSheetTitle;
  }) => {
    present({
      size: "full",
      scrollable: false,
      title: bottomSheetTitle[type],
      render: () => <WordSelectForm />,
    });
  };

  const onLabelLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;

    setLabelWidth((prev) => (width > prev ? width : prev));
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

          <View className="mt-12">
            <WordCreateBasicForm
              labelWidth={labelWidth}
              onLabelLayout={onLabelLayout}
              openInputModal={openInputModal}
              openRadioModal={openRadioModal}
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
                openInputModal={openInputModal}
                openRadioModal={openRadioModal}
              />
            </View>
          </View>

          {/* Form link */}

          <View className="mt-8">
            <WordCreateAdvanceForm
              openInputModal={openInputModal}
              openRadioModal={openRadioModal}
              openWordSelectModal={openWordSelectForm}
              labelWidth={labelWidth}
              onLabelLayout={onLabelLayout}
            />
          </View>
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
