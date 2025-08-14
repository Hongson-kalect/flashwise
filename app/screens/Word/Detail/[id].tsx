import AppButton from "@/components/AppButton";
import { AppDivider } from "@/components/AppDivider";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { LayoutChangeEvent, ScrollView, View } from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import WordSelectForm from "../Create/components/wordSelectForm";
import {
  bottomSheetTitle,
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "../Create/screen";
import WordAdvanceInformation from "./components/advanceInfomation";
import BasicInformation from "./components/basicInformation";
import WordDetailHeader from "./components/header";
import WordMoreInformation from "./components/morelInformation";

const WordDetail = () => {
  const { theme } = useTheme();
  const { setGlobalModal, setListModal } = useModalStore();
  const { present } = useBottomSheet();
  const { id } = useLocalSearchParams();
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
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <View>
        <WordDetailHeader mode={pageMode} setMode={setPageMode} />
      </View>
      <AppDivider />

      <ScrollView>
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

      {/* <AppText>Từ liên quan (search- chọn)</AppText> */}
    </View>
  );
};

export default WordDetail;
