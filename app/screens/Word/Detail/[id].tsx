import Accordion from "@/components/AppArccodion";
import AppButton from "@/components/AppButton";
import CollapseSection from "@/components/AppCollapsable";
import { AppDivider } from "@/components/AppDivider";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import {
  bottomSheetTitle,
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "@/interfaces/word";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import WordSelectForm from "../Create/components/wordSelectForm";
import { testData, WordType } from "../data";
import { basicWordMapping } from "../utils/utils";
import WordAdvanceInformation from "./components/advanceInfomation";
import BasicInformation from "./components/basicInformation";
import WordDetailHeader from "./components/header";
import SenseItem from "./Sense/Components/senseItem";

const DATA: WordType[] = testData;

const WordDetail = () => {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams();
  const [pageMode, setPageMode] = useState<"view" | "update">("view");
  const [tabIndex, setTabIndex] = useState(0);
  const [languageMode, setLanguageMode] = useState<1 | 2>(1); // hiển thị single lang or 2 lang

  const data = useMemo(() => basicWordMapping(DATA), [DATA]);

  const [word, setWord] = useState(() => {
    const val = data[0].value || "";
    return val[0].toUpperCase() + val.slice(1);
  }, []);

  const toggleLanguageMode = () =>
    setLanguageMode((prev) => (prev === 1 ? 2 : 1));

  return (
    <Tabs.Container
      onTabChange={(props) => {
        setTabIndex(props.index);
      }}
      renderHeader={() => (
        <View className="mb-4">
          <WordDetailHeader
            languageMode={languageMode}
            setLanguageMode={setLanguageMode}
            mode={pageMode}
            setMode={setPageMode}
          />
          {/* <WordInput editable={mode !== "view"} value={word} /> */}
          {/* <View className="items-center py-2">
            <AppText color="primary" size={40} font="MulishSemiBold">
              {word}
            </AppText>
          </View> */}
        </View>
      )}
      renderTabBar={(props) => <MaterialTabBar {...props} scrollEnabled />}
    >
      {data.map((item, index) => {
        const isActive = index === tabIndex;
        return (
          <Tabs.Tab
            key={index}
            label={() => (
              <AppText
                color={isActive ? "primary" : "subText2"}
                font={"MulishMedium"}
                className="w-full items-center justify-center h-10 px-2"
              >
                {item.wordInfo.pos[0].toUpperCase() +
                  item.wordInfo.pos.slice(1)}
              </AppText>
            )}
            name={item.id}
          >
            <Tabs.ScrollView>
              {pageMode === "view" ? (
                <WordInfo
                  languageMode={languageMode}
                  data={item}
                  mode={pageMode}
                />
              ) : (
                <SenseEdit
                  languageMode={languageMode}
                  data={item}
                  mode={pageMode}
                />
              )}
            </Tabs.ScrollView>
          </Tabs.Tab>
        );
      })}
    </Tabs.Container>
  );
};

type WordInfoType = {
  data: WordType;
  mode?: "create" | "update" | "view";
  languageMode: 1 | 2;
};
const WordInfo = (props: WordInfoType) => {
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
        <View className="mt-2">
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

      {/* <View className="mt-8 px-4">
        <AppButton
          title="Xem bản dịch"
          type="primary"
          size="lg"
          onPress={() =>
            router.push("/screens/Word/Create/Translate/List/screen")
          }
        />
      </View> */}
      <View className="h-10"></View>
    </View>
  );
};

type SenseProps = {
  languageMode: 1 | 2;
  data: WordType;
  mode?: "create" | "update" | "view";
};
const SenseEdit = (props: SenseProps) => {
  const isActive = true;

  return (
    <View className="py-4">
      <View className="mb-4 flex-row items-center justify-end px-2">
        <AppButton
          onPress={() => {
            router.push({
              pathname: "/screens/Word/Detail/Sense/Create/screen",
              params: {
                wordId: props.data.id,
                languageMode: props.languageMode,
                pos: props.data.wordInfo.pos,
              },
            });
          }}
        >
          <AppIcon branch="antd" name="plus" size={16} color="white" />
          <AppText color="white" size="sm" font="MulishBold">
            Add sense
          </AppText>
        </AppButton>
      </View>
      <CollapseSection title="Sense 1: Dumamu">
        <SenseItem
          languageMode={props.languageMode}
          data={props.data}
          mode={props.mode}
        />
      </CollapseSection>
      <Accordion active={isActive} title={"Sense 1: Dumamu"}>
        <WordInfo
          languageMode={props.languageMode}
          data={props.data}
          mode={props.mode}
        />
      </Accordion>
    </View>
  );
};

export default WordDetail;

const styles = StyleSheet.create({
  box: {
    height: 250,
    width: "100%",
  },
  boxA: {
    backgroundColor: "white",
  },
  boxB: {
    backgroundColor: "#D8D8D8",
  },
  header: {
    height: 200,
    width: "100%",
    backgroundColor: "#2196f3",
  },
});
