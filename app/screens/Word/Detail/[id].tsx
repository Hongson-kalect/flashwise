import AppButton from "@/components/AppButton";
import { AppDivider } from "@/components/AppDivider";
import AppIcon from "@/components/AppIcon";
import { AppTopNav } from "@/components/AppTopNav";
import WordInput from "@/components/input/wordInput";
import {
  bottomSheetTitle,
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "@/interfaces/word";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { LayoutChangeEvent, ScrollView, View } from "react-native";
import WordSelectForm from "../Create/components/wordSelectForm";
import WordAdvanceInformation from "./components/advanceInfomation";
import BasicInformation from "./components/basicInformation";
import WordDetailHeader from "./components/header";
import WordMoreInformation from "./components/morelInformation";

const WordDetail = () => {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams();
  const [pageMode, setPageMode] = useState<"view" | "update">("view");
  const [mode, setMode] = useState<"view" | "update">("view");

  return (
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <AppTopNav
        header={
          <View className="mb-4">
            <WordDetailHeader mode={pageMode} setMode={setPageMode} />
            <WordInput editable={mode !== "view"} value="Free" />
            {/* <AppDivider /> */}
          </View>
        }
        tabs={[
          {
            element: WordInfo,
            label: "Động từ",
            key: "1",
            icon: <AppIcon branch="antd" name="home" />,
          },
          {
            element: WordInfo,
            key: "2",
            label: "Danh từ",
          },
          {
            element: WordInfo,
            key: "3",
            label: "Tính từ",
          },
          {
            element: WordInfo,
            key: "4",
            label: "Phó từ",
          },
          {
            element: WordInfo,
            key: "5",
            label: "Trạng từ",
          },
        ]}
      />

      {/* <AppText>Từ liên quan (search- chọn)</AppText> */}
    </View>
  );
};

const WordInfo = () => {
  const { theme } = useTheme();
  const { setGlobalModal, setListModal } = useModalStore();
  const { present } = useBottomSheet();
  const [labelWidth, setLabelWidth] = useState(0);
  const [pageMode, setPageMode] = useState<"view" | "update">("view");
  const onLabelLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;

    setLabelWidth((prev) => (width > prev ? width : prev));
  };

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

  return (
    <ScrollView className="bg-gray-50">
      <View className="px-2">
        <View className="mt-6">
          <BasicInformation
            mode={pageMode}
            labelWidth={labelWidth}
            onLabelLayout={onLabelLayout}
            openInputModal={openInputModal}
            openRadioModal={openRadioModal}
          />
        </View>

        <View className="mt-6">
          <WordMoreInformation
            mode={pageMode}
            labelWidth={labelWidth}
            onLabelLayout={onLabelLayout}
            openInputModal={openInputModal}
            openRadioModal={openRadioModal}
          />
        </View>

        <AppDivider style={{ marginTop: 16, marginBottom: 12 }} />

        <View>
          <WordAdvanceInformation
            mode={pageMode}
            labelWidth={labelWidth}
            onLabelLayout={onLabelLayout}
            openInputModal={openInputModal}
            openRadioModal={openRadioModal}
            openWordSelectModal={openWordSelectForm}
          />
        </View>
      </View>

      <AppDivider style={{ marginTop: 16, marginBottom: 8 }} />

      <View className="mt-8 px-4">
        <AppButton
          title="Xem bản dịch"
          type="primary"
          size="lg"
          onPress={() =>
            router.push("/screens/Word/Create/Translate/List/screen")
          }
        />
      </View>
      <View className="h-10"></View>
    </ScrollView>
  );
};

export default WordDetail;
