import AppButton from "@/components/AppButton";
import { AppDivider } from "@/components/AppDivider";
import AppText from "@/components/AppText";
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
import React, { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  ListRenderItem,
  StyleSheet,
  View,
} from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import WordSelectForm from "../Create/components/wordSelectForm";
import { testData, WordType } from "../data";
import { basicWordMapping } from "../utils/utils";
import WordAdvanceInformation from "./components/advanceInfomation";
import BasicInformation from "./components/basicInformation";
import WordDetailHeader from "./components/header";

const HEADER_HEIGHT = 250;

const DATA: WordType[] = testData;

const WordDetail = () => {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams();
  const [pageMode, setPageMode] = useState<"view" | "update">("view");
  const [mode, setMode] = useState<"view" | "update">("view");
  const [tabIndex, setTabIndex] = useState(0);
  const [languageMode, setLanguageMode] = useState<1 | 2>(1); // hiển thị single lang or 2 lang

  const data = useMemo(() => basicWordMapping(DATA), [DATA]);

  const renderItem: ListRenderItem<number> = React.useCallback(({ index }) => {
    return (
      <View style={[styles.box, index % 2 === 0 ? styles.boxB : styles.boxA]} />
    );
  }, []);

  const [word, setWord] = useState(() => {
    const val = data[0].value || "";
    return val[0].toUpperCase() + val.slice(1);
  }, []);

  return (
    // <View style={{ backgroundColor: theme.background }} className="flex-1">
    // <Tabs.Container
    //   renderHeader={() => (
    //     <View className="mb-4">
    //       <WordDetailHeader mode={pageMode} setMode={setPageMode} />
    //       <WordInput editable={mode !== "view"} value="Free" />
    //       {/* <AppDivider /> */}
    //     </View>
    //   )}
    //   // headerHeight={HEADER_HEIGHT} // optional
    // >
    //   <Tabs.Tab name="A">
    //     <Tabs.FlatList
    //       data={[1, 2, 3]}
    //       renderItem={WordInfo}
    //       keyExtractor={(item, index) => index.toString()}
    //     />
    //   </Tabs.Tab>
    //   <Tabs.Tab name="B">
    //     <Tabs.ScrollView>
    //       <View style={[styles.box, styles.boxA]} />
    //       <View style={[styles.box, styles.boxB]} />
    //     </Tabs.ScrollView>
    //   </Tabs.Tab>
    // </Tabs.Container>
    <Tabs.Container
      onTabChange={(props) => {
        setTabIndex(props.index);
      }}
      renderHeader={() => (
        <View className="mb-4">
          <WordDetailHeader mode={pageMode} setMode={setPageMode} />
          <WordInput editable={mode !== "view"} value={word} />
          {/* <AppText>{tabName}</AppText> */}
          {/* <AppDivider /> */}
        </View>
      )}
      renderTabBar={(props) => <MaterialTabBar {...props} scrollEnabled />}
      // allowHeaderOverscroll={true}
      headerHeight={HEADER_HEIGHT} // optional
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
              <WordInfo
                languageMode={languageMode}
                toggleLanguageMode={() =>
                  setLanguageMode((prev) => (prev === 1 ? 2 : 1))
                }
                data={item}
                mode={pageMode}
              />
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
  toggleLanguageMode: () => void;
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
    <View className="bg-gray-50">
      <View className="px-2">
        <View className="mt-2">
          <BasicInformation
            definations={props.data.definations}
            data={props.data.wordInfo}
            mode={props.mode}
            languageMode={props.languageMode}
            toggleLanguageMode={props.toggleLanguageMode}
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
