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
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, Platform, Pressable, ToastAndroid, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import Animated, { FadeIn } from "react-native-reanimated";
import WordSelectForm from "../Create/components/wordSelectForm";
import { SenseType } from "../data";
import WordAdvanceInformation from "./components/advanceInfomation";
import BasicInformation from "./components/basicInformation";
import WordCollocations from "./components/collocations";
import WordDetailHeader from "./components/header";
import SenseSkeleton from "@/components/skeleton/SenseSkeleton";
import { WordLoadingContext } from "./loadingContext";
import { useWordData } from "./useWordData";
import WordStatus from "./components/wordStatus";
import { mapSenses } from "./utils";
import { SenseContext, SenseSavedContext } from "./senseEdit";
import { ItemKind, removeItems } from "@/services/senseLists";
import { useAppStore } from "@/stores/appStore";

// const DATA: WordType[] = testData;

function WordDetailWrapper() {
  const { value } = useLocalSearchParams<{ value: string }>();

  return (
    <>
      {/* Cấu hình getId ngay tại đây */}
      <Stack.Screen getId={() => value} />

      {/* Phần UI và logic hiện tại của bạn */}
      <WordDetail key={value} word={value} />
    </>
  );
}

const WordDetail = ({ word }: { word: string }) => {
  const { theme } = useTheme();
  const { state: sensesObj, retry, refresh, hadLocal } = useWordData(word);
  // Mở từ này từ 1 chip trong danh sách của nghĩa khác (from = id nghĩa, kind = danh sách). Từ bị từ chối thì gỡ khỏi danh sách đó và quay lại
  const { from, kind } = useLocalSearchParams<{ from?: string; kind?: ItemKind }>();
  const userLang = useAppStore((s) => s.settings?.translate_language) ?? "vi";
  useEffect(() => {
    if (sensesObj.error?.code !== "rejected" || !from || !kind) return;
    removeItems({ senseId: from, kind, words: [word], userLang }); // không gỡ được thì thôi, người dùng tự xoá
    if (Platform.OS === "android") ToastAndroid.show(`"${word}" không phải từ hợp lệ, đã gỡ khỏi danh sách`, ToastAndroid.LONG);
    router.back();
  }, [sensesObj.error?.code]);
  const senses = useMemo(() => mapSenses(sensesObj), [sensesObj]);
  const [pageMode, setPageMode] = useState<"view" | "update">("view");
  const [tabIndex, setTabIndex] = useState(0);
  // Chỉ số nghĩa đang xem trong từng tab loại từ, để menu 3 chấm sửa đúng nghĩa đang hiện
  const [senseIdx, setSenseIdx] = useState<Record<number, number>>({});
  const activeSense = senses?.entries[tabIndex]?.senses[senseIdx[tabIndex] ?? 0];

  return (
    <WordLoadingContext.Provider value={sensesObj.isLoading}>
    <SenseSavedContext.Provider value={refresh}>
    <Tabs.Container
      onTabChange={(props) => {
        setTabIndex(props.index);
      }}
      renderHeader={() => (
        <View className="mb-4">
          <WordDetailHeader
            isLoading={sensesObj.isLoading}
            word={word ? word[0].toUpperCase() + word.slice(1) : "###"}
            mode={pageMode}
            setMode={setPageMode}
            wordId={sensesObj.id}
            senses={sensesObj.senses}
            onSenseAdded={refresh}
            activeSense={activeSense}
          />
          <WordStatus state={sensesObj} hadLocal={hadLocal} onRetry={retry} />

          {/* <AppText color="primary" size={40} font="MulishSemiBold">
            {word}
          </AppText> */}
          {/* <AppText color="primary">{JSON.stringify(senses)}</AppText> */}
          {/* <WordInput editable={mode !== "view"} value={word} /> */}
          {/* <View className="items-center py-2">
            <AppText color="primary" size={40} font="MulishSemiBold">
              {word}
            </AppText>
          </View> */}
        </View>
      )}
      headerContainerStyle={{ backgroundColor: theme.background, shadowOpacity: 0, elevation: 0 }}
      containerStyle={{ backgroundColor: theme.background }}
      renderTabBar={(props) => (
        <MaterialTabBar
          {...props}
          scrollEnabled
          style={{ backgroundColor: theme.background, elevation: 0, shadowOpacity: 0 }}
          indicatorStyle={{ backgroundColor: theme.primary, height: 3, borderRadius: 3 }}
          activeColor={theme.primary}
          inactiveColor={theme.subText2}
          labelStyle={{ fontFamily: "MulishBold", textTransform: "none" }}
        />
      )}
    >
      {/* {senses ? ( */}
      {senses && senses.entries.length > 0 ? (
        senses.entries.map(
          (item: { pos: string; senses: SenseType[] }, index: number) => {
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
                    {item.pos[0].toUpperCase() + item.pos.slice(1)}
                  </AppText>
                )}
                name={item.pos.toString()}
              >
                <Tabs.ScrollView style={{ backgroundColor: theme.background }}>
                  {/* <AppText>{JSON.stringify(item.senses)}</AppText> */}
                  <SensesInfo
                    word={word}
                    data={item.senses}
                    mode={pageMode}
                    senseIndex={senseIdx[index] ?? 0}
                    setSenseIndex={(i) => setSenseIdx((m) => ({ ...m, [index]: i }))}
                  />
                </Tabs.ScrollView>
              </Tabs.Tab>
            );
          },
        )
      ) : (
        <Tabs.Tab
          label={() => (
            <AppText
              color={"subText2"}
              font={"MulishMedium"}
              className="w-full items-center justify-center h-10 px-2"
            >
              {sensesObj.error ? " " : "Đang tải…"}
            </AppText>
          )}
          name={tabIndex.toString()}
        >
          <Tabs.ScrollView style={{ backgroundColor: theme.background }}>
            <View style={{ height: 120 }} />
            {/* {socketData.map((item, index) => {
              return (
                <View key={index}>
                  <AppText>
                    {item?.time} - {JSON.stringify(item?.data)}
                  </AppText>
                  <Divider style={{ marginVertical: 8 }} />
                </View>
              );
            })} */}
          </Tabs.ScrollView>
        </Tabs.Tab>
      )}
      {/* {data.map((item, index) => {
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
                word={word}
                data={item}
                mode={pageMode}
              />
            </Tabs.ScrollView>
          </Tabs.Tab>
        );
      })} */}
    </Tabs.Container>
    </SenseSavedContext.Provider>
    </WordLoadingContext.Provider>
  );
};

type SensesInfoType = {
  word: string;
  data: SenseType[];
  mode?: "create" | "update" | "view";
  senseIndex: number;
  setSenseIndex: (i: number) => void;
};
const SensesInfo = (props: SensesInfoType) => {
  const { senseIndex, setSenseIndex } = props;

  const activeSense = useMemo(() => {
    return props.data[senseIndex];
  }, [props.data, senseIndex]);

  return (
    <View>
      <Animated.View
        entering={FadeIn}
        style={{ top: 10, right: 10, zIndex: 1 }}
        className=" absolute flex-row items-center gap-2"
      >
        <Pressable
          hitSlop={20}
          className="h-10 w-10 rounded-lg items-center justify-center"
          disabled={senseIndex === 0}
          onPress={() => senseIndex > 0 && setSenseIndex(senseIndex - 1)}
        >
          <AppIcon
            color={senseIndex === 0 ? "subText3" : "primary"}
            branch="antd"
            name={"left"}
            size={20}
          />
        </Pressable>
        <View className="items-center justify-center">
          <AppText color="primary" font="MulishBold" size={18}>
            <AppText color="subText2" size={"sm"}>
              sense
            </AppText>{" "}
            {senseIndex + 1}{" "}
            <AppText color="subText2" size={"sm"}>
              /{props.data.length}
            </AppText>
          </AppText>
        </View>
        <Pressable
          className="h-10 w-10 rounded-lg  items-center justify-center"
          hitSlop={20}
          disabled={senseIndex === props.data.length - 1}
          onPress={() =>
            senseIndex < props.data.length - 1 && setSenseIndex(senseIndex + 1)
          }
        >
          <AppIcon
            branch="antd"
            color={
              senseIndex === props.data.length - 1 ? "subText2" : "primary"
            }
            name={"right"}
            size={20}
          />
        </Pressable>
      </Animated.View>

      {/* <AppText>{JSON.stringify(activeSense)}</AppText> */}

      {activeSense?.contents?.definition ? (
        <SenseContext.Provider value={activeSense}>
          <SenseInfo word={props.word} data={activeSense} mode={props.mode} />
        </SenseContext.Provider>
      ) : (
        <View className="px-3 pt-14">
          <SenseSkeleton />
        </View>
      )}
    </View>
  );
};

type WordInfoType = {
  word: string;
  data: SenseType;
  mode?: "create" | "update" | "view";
};
const SenseInfo = (props: WordInfoType) => {
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
    <View style={{ backgroundColor: theme.background }}>
      <View className="px-2">
        <View className="mt-2">
          <BasicInformation
            word={props.word}
            sense={props.data}
            mode={props.mode}
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

        <View className="mt-6">
          <WordCollocations
            list={props.data.metadata?.advanced?.collocations || []}
          />
        </View>

        {/* <AppDivider style={{ marginTop: 8, marginBottom: 12 }} /> */}

        <View className="mt-6">
          <WordAdvanceInformation
            relateds={props.data.metadata?.advanced.relateds || []}
            synonyms={props.data.metadata?.advanced.synonyms || []}
            antonyms={props.data.metadata?.advanced.antonyms || []}
            forms={props.data.metadata?.advanced.forms || []}
            tags={props.data.metadata?.tags || []}
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
      <View className="h-10"></View>
    </View>
  );
};

export default WordDetailWrapper;
