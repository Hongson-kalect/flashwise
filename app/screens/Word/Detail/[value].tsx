import { AppDivider } from "@/components/AppDivider";
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
import { LayoutChangeEvent, Pressable, ScrollView, View } from "react-native";
import { CollapsibleRef, Tabs } from "react-native-collapsible-tab-view";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
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
import { FormFocus, FormFocusContext, WordFormsContext } from "./formsContext";
import { formTagLabel } from "@/utils/formTags";

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
  // Chỉ khi nghĩa đang hiện là của từ gốc mà người dùng mở bằng dạng biến cách (get-word trả form_of); dạng có mục riêng hiện nghĩa riêng
  const formFocus = useMemo<FormFocus | null>(() => {
    const f = sensesObj.formOf;
    if (!f || f.own_entry) return null;
    const own = f.candidates.filter((c) => c.lemma === f.lemma);
    return {
      form: f.form,
      pos: [...new Set(own.map((c) => c.pos))],
      tags: [...new Set(own.map((c) => formTagLabel(c.tag)))],
    };
  }, [sensesObj.formOf]);
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
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const container = useRef<CollapsibleRef>(null);
  const goPage = (i: number) => {
    const target = pages[i];
    if (target) container.current?.jumpToTab(target.sense.id);
  };
  // Thứ tự nghĩa đổi (đặt nghĩa chính, thêm nghĩa...): giữ người dùng ở đúng nghĩa đang xem thay vì ở cùng vị trí số
  const viewingId = useRef<string | null>(null);
  // Thư viện tab báo onTabChange ngay sau khi trang bị sắp lại (giữ nguyên vị trí số, nghĩa khác): bỏ qua trong lúc đó
  // để không ghi đè nghĩa đang xem. Lần đầu có nghĩa (từ "Đang tải…") không tính là đổi thứ tự.
  const orderSig = useRef("");
  const reorderUntil = useRef(0);
  const sig = pages.map((p) => p.sense.id).join(",");
  if (orderSig.current !== sig) {
    if (orderSig.current) reorderUntil.current = Date.now() + 1000;
    orderSig.current = sig;
  }
  useEffect(() => {
    const id = viewingId.current;
    if (!id || pages[pageIndex]?.sense.id === id) return;
    if (!pages.some((p) => p.sense.id === id)) return;
    // Chờ thư viện tab nhận danh sách trang mới rồi mới nhảy (nhảy ngay thì bị bỏ qua)
    const t = setTimeout(() => container.current?.jumpToTab(id), 120);
    return () => clearTimeout(t);
  }, [pages]);
  const activeSense = pages[pageIndex]?.sense;

  return (
    <WordLoadingContext.Provider value={sensesObj.isLoading}>
    <WordFormsContext.Provider value={wordForms ?? null}>
    <FormFocusContext.Provider value={formFocus}>
    <SenseSavedContext.Provider value={refresh}>
    <Tabs.Container
      ref={container}
      lazy
      onTabChange={(props) => {
        setPageIndex(props.index);
        if (Date.now() > reorderUntil.current) viewingId.current = pagesRef.current[props.index]?.sense.id ?? null;
        // Sang loại từ khác thì rung nhẹ (có sau khi build native có expo-haptics; chưa có thì bỏ qua)
        const list = pagesRef.current;
        if (list[props.index]?.pos !== list[props.prevIndex]?.pos) {
          try {
            require("expo-haptics").selectionAsync().catch(() => {});
          } catch {}
        }
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
      renderTabBar={(props) => (
        <PosTabBar pages={pages} pageIndex={pageIndex} indexDecimal={props.indexDecimal} onPress={goPage} />
      )}
    >
      {/* {senses ? ( */}
      {pages.length > 0 ? (
        pages.map((page) => (
          <Tabs.Tab key={page.sense.id} label={page.pos} name={page.sense.id}>
            <Tabs.ScrollView style={{ backgroundColor: theme.background }}>
              <SensesInfo
                word={word}
                sense={page.sense}
                mode={pageMode}
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
    </FormFocusContext.Provider>
    </WordFormsContext.Provider>
    </WordLoadingContext.Provider>
  );
};

/**
 * Thanh loại từ: các trang gom theo loại từ, "viên thuốc" nền trượt theo ngón tay khi vuốt (nội suy theo vị trí cuộn của pager),
 * chạm tab nhảy tới nghĩa đầu của loại từ. Hàng chấm bên dưới: mỗi nghĩa một chấm, chấm đang xem kéo dài ra, nhóm theo loại từ.
 */
const PosTabBar = ({
  pages,
  pageIndex,
  indexDecimal,
  onPress,
}: {
  pages: { pos: string }[];
  pageIndex: number;
  indexDecimal: SharedValue<number>;
  onPress: (index: number) => void;
}) => {
  const { theme } = useTheme();
  const [layouts, setLayouts] = useState<Record<number, { x: number; w: number }>>({});
  const groups = pages.reduce<{ pos: string; start: number; count: number }[]>((acc, p, i) => {
    const last = acc[acc.length - 1];
    if (last && last.pos === p.pos) last.count++;
    else acc.push({ pos: p.pos, start: i, count: 1 });
    return acc;
  }, []);
  const groupOfPage = pages.map((_, i) => groups.findIndex((g) => i >= g.start && i < g.start + g.count));
  const ready = groups.length > 0 && groups.every((g) => layouts[g.start]);
  // Vị trí / bề rộng viên thuốc theo từng trang: các trang cùng loại từ cùng một chỗ, nên chỉ trượt khi vuốt qua loại từ khác
  const xs = pages.map((_, i) => layouts[groups[groupOfPage[i]]?.start]?.x ?? 0);
  const ws = pages.map((_, i) => layouts[groups[groupOfPage[i]]?.start]?.w ?? 0);
  const inputs = pages.map((_, i) => i);

  const pill = useAnimatedStyle(() => {
    if (!ready) return { opacity: 0 };
    if (pages.length < 2) return { opacity: 1, width: ws[0], transform: [{ translateX: xs[0] }] };
    return {
      opacity: 1,
      width: interpolate(indexDecimal.value, inputs, ws, Extrapolation.CLAMP),
      transform: [{ translateX: interpolate(indexDecimal.value, inputs, xs, Extrapolation.CLAMP) }],
    };
  });

  if (!groups.length) return <View style={{ height: 8 }} />;
  return (
    <View style={{ backgroundColor: theme.background, paddingTop: 4, paddingBottom: 10 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            { position: "absolute", left: 16, top: 0, bottom: 0, borderRadius: 18, backgroundColor: theme.primary + "1F" },
            pill,
          ]}
        />
        {groups.map((g) => {
          const active = pageIndex >= g.start && pageIndex < g.start + g.count;
          return (
            <Pressable
              key={g.pos}
              onPress={() => onPress(g.start)}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                setLayouts((m) => (m[g.start]?.x === x - 16 && m[g.start]?.w === width ? m : { ...m, [g.start]: { x: x - 16, w: width } }));
              }}
              className="px-4 h-9 flex-row items-center justify-center gap-1.5"
            >
              <AppText color={active ? "primary" : "subText2"} font="MulishBold">
                {g.pos[0].toUpperCase() + g.pos.slice(1)}
              </AppText>
              {g.count > 1 && (
                <AppText size="xs" color={active ? "primary" : "subText3"} font="MulishBold">
                  {g.count}
                </AppText>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
      {pages.length > 1 && (
        <View className="flex-row items-center justify-center mt-2" style={{ gap: 4 }}>
          {pages.map((_, i) => (
            <Dot
              key={i}
              index={i}
              indexDecimal={indexDecimal}
              color={theme.primary}
              gapBefore={i > 0 && groupOfPage[i] !== groupOfPage[i - 1] ? 8 : 0}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const Dot = ({
  index,
  indexDecimal,
  color,
  gapBefore,
}: {
  index: number;
  indexDecimal: SharedValue<number>;
  color: string;
  gapBefore: number;
}) => {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(indexDecimal.value - index);
    return {
      width: interpolate(d, [0, 1], [18, 6], Extrapolation.CLAMP),
      opacity: interpolate(d, [0, 1], [1, 0.3], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: color, marginLeft: gapBefore }, style]} />;
};

type SensesInfoType = {
  word: string;
  sense: SenseType;
  mode?: "create" | "update" | "view";
};
const SensesInfo = (props: SensesInfoType) => {
  const activeSense = props.sense;

  return (
    <View>
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
