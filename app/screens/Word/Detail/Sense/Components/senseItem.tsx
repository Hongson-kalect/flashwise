import AppButton from "@/components/AppButton";
import { AppDivider } from "@/components/AppDivider";
import {
  bottomSheetTitle,
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "@/interfaces/word";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { router } from "expo-router";
import { useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import WordSelectForm from "../../../Create/components/wordSelectForm";
import { WordType } from "../../../data";
import WordAdvanceInformation from "./advanceInfomation";
import BasicInformation from "./basicInformation";

type WordInfoType = {
  data: WordType;
  mode?: "create" | "update" | "view";
  languageMode: 1 | 2;
};
const SenseItem = (props: WordInfoType) => {
  const { theme } = useTheme();
  const { setGlobalModal, setListModal } = useModalStore();
  const { present } = useBottomSheet();
  const [labelWidth, setLabelWidth] = useState(0);
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
    <View className="bg-white">
      <View className="px-2">
        <View className="pt-2">
          <BasicInformation
            definations={props.data.definations}
            data={props.data.wordInfo}
            mode={props.mode}
            languageMode={props.languageMode}
            translates={props.data.translates}
            labelWidth={labelWidth}
            onLabelLayout={onLabelLayout}
            openInputModal={openInputModal}
            openRadioModal={openRadioModal}
          />
        </View>

        {/* <View className="mt-6">
          <WordMoreInformation
            mode={props.mode}
            labelWidth={labelWidth}
            onLabelLayout={onLabelLayout}
            openInputModal={openInputModal}
            openRadioModal={openRadioModal}
          />
        </View> */}

        {/* <AppDivider style={{ marginTop: 8, marginBottom: 12 }} /> */}

        <View className="mt-4">
          <WordAdvanceInformation
            related={props.data.relateds}
            synonym={props.data.synonyms}
            antonym={props.data.antonyms}
            form={props.data.forms}
            mode={props.mode}
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
    </View>
  );
};

export default SenseItem;
