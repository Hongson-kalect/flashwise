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
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, View } from "react-native";
import { CollapsibleRef, Tabs } from "react-native-collapsible-tab-view";
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
import { useQuery } from "@tanstack/react-query";
import { fetchWordForms } from "@/services/api/words";
import { WordFormsContext } from "./formsContext";

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
  // Mở từ này từ 1 chip trong danh sách của nghĩa khác (from = id nghĩa, kind = danh sách). Từ bị từ chối thì gỡ khỏi danh sách đó, trang vẫn báo không hợp lệ như tra từ thường
  const { from, kind } = useLocalSearchParams<{ from?: string; kind?: ItemKind }>();
  const userLang = useAppStore((s) => s.settings?.translate_language) ?? "vi";
  useEffect(() => {
    if (sensesObj.error?.code !== "rejected" || !from || !kind) return;
    removeItems({ senseId: from, kind, words: [word], userLang }); // không gỡ được thì thôi, người dùng tự xoá
  }, [sensesObj.error?.code]);
  const senses = useMemo(() => mapSenses(sensesObj), [sensesObj]);
  // Dạng biến cách của từ (phần "Biến thể") và gợi ý "cũng là dạng của …": tải riêng, không chặn việc hiện nghĩa
  const wordId = sensesObj.status === "COMPLETED" ? sensesObj.id : undefined;
  const { data: wordForms } = useQuery({
    queryKey: ["word-forms", wordId],
    queryFn: () => fetchWordForms(wordId as string),
    enabled: !!wordId,
    staleTime: 10 * 60_000,
  });
  const formOf = sensesObj.formOf ?? wordForms?.also_form_of ?? null;
  const [pageMode, setPageMode] = useState<"view" | "update">("view");
  // Mỗi nghĩa là một trang: vuốt trái / phải đi tuyến tính qua mọi nghĩa (hết nghĩa của loại từ này thì sang loại từ kế).
  // Tên trang = id nghĩa, để sau khi tải lại / thêm nghĩa trang không bị lệch.
  const pages = useMemo(
    () =>
      (senses?.entries ?? []).flatMap((e: { pos: string; senses: SenseType[] }) =>
        e.senses.map((sense, i) => ({ pos: e.pos, sense, index: i, count: e.senses.length })),
      ),
    [senses],
  );
  const [pageIndex, setPageIndex] = useState(0);
  const container = useRef<CollapsibleRef>(null);
  const goPage = (i: number) => {
    const target = pages[i];
    if (target) container.current?.jumpToTab(target.sense.id);
  };
  const activeSense = pages[pageIndex]?.sense;

  return (
    <WordLoadingContext.Provider value={sensesObj.isLoading}>
    <WordFormsContext.Provider value={wordForms ?? null}>
    <SenseSavedContext.Provider value={refresh}>
    <Tabs.Container
      ref={container}
      lazy
      onTabChange={(props) => {
        setPageIndex(props.index);
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
          <WordStatus state={sensesObj} hadLocal={hadLocal} onRetry={retry} formOf={formOf} />

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
      renderTabBar={() => <PosTabBar pages={pages} pageIndex={pageIndex} onPress={goPage} />}
    >
      {/* {senses ? ( */}
      {pages.length > 0 ? (
        pages.map((page, index) => (
          <Tabs.Tab key={page.sense.id} label={page.pos} name={page.sense.id}>
            <Tabs.ScrollView style={{ backgroundColor: theme.background }}>
              <SensesInfo
                word={word}
                sense={page.sense}
                mode={pageMode}
                senseIndex={page.index}
                senseCount={page.count}
                onPrev={index > 0 ? () => goPage(index - 1) : undefined}
                onNext={index < pages.length - 1 ? () => goPage(index + 1) : undefined}
              />
            </Tabs.ScrollView>
          </Tabs.Tab>
        ))
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
          name="loading"
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
    </WordFormsContext.Provider>
    </WordLoadingContext.Provider>
  );
};

/** Thanh loại từ: gom các trang theo loại từ, chạm để nhảy tới nghĩa đầu tiên của loại từ đó. Chỉ báo bám theo trang đang xem. */
const PosTabBar = ({
  pages,
  pageIndex,
  onPress,
}: {
  pages: { pos: string }[];
  pageIndex: number;
  onPress: (index: number) => void;
}) => {
  const { theme } = useTheme();
  const groups = pages.reduce<{ pos: string; start: number; count: number }[]>((acc, p, i) => {
    const last = acc[acc.length - 1];
    if (last && last.pos === p.pos) last.count++;
    else acc.push({ pos: p.pos, start: i, count: 1 });
    return acc;
  }, []);
  if (!groups.length) return <View style={{ height: 8 }} />;
  return (
    <View className="flex-row" style={{ backgroundColor: theme.background }}>
      {groups.map((g) => {
        const active = pageIndex >= g.start && pageIndex < g.start + g.count;
        return (
          <Pressable
            key={g.pos}
            onPress={() => onPress(g.start)}
            className="px-4 h-11 items-center justify-center"
            style={{ borderBottomWidth: 3, borderBottomColor: active ? theme.primary : "transparent" }}
          >
            <AppText color={active ? "primary" : "subText2"} font="MulishBold">
              {g.pos[0].toUpperCase() + g.pos.slice(1)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

type SensesInfoType = {
  word: string;
  sense: SenseType;
  mode?: "create" | "update" | "view";
  /** Vị trí / tổng số nghĩa trong loại từ của trang này. */
  senseIndex: number;
  senseCount: number;
  /** Chuyển sang trang nghĩa trước / sau (có thể sang loại từ khác); không có = đã ở đầu / cuối. */
  onPrev?: () => void;
  onNext?: () => void;
};
const SensesInfo = (props: SensesInfoType) => {
  const { senseIndex, senseCount, onPrev, onNext } = props;
  const activeSense = props.sense;

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
          disabled={!onPrev}
          onPress={onPrev}
        >
          <AppIcon color={onPrev ? "primary" : "subText3"} branch="antd" name={"left"} size={20} />
        </Pressable>
        <View className="items-center justify-center">
          <AppText color="primary" font="MulishBold" size={18}>
            <AppText color="subText2" size={"sm"}>
              sense
            </AppText>{" "}
            {senseIndex + 1}{" "}
            <AppText color="subText2" size={"sm"}>
              /{senseCount}
            </AppText>
          </AppText>
        </View>
        <Pressable
          className="h-10 w-10 rounded-lg  items-center justify-center"
          hitSlop={20}
          disabled={!onNext}
          onPress={onNext}
        >
          <AppIcon color={onNext ? "primary" : "subText3"} branch="antd" name={"right"} size={20} />
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
      <View className="px-4">
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
