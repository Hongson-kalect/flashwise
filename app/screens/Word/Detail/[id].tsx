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
import { GetAPI } from "@/services/axios";
import { useAppStore } from "@/stores/appStore";
import useModalStore from "@/stores/modalStore";
import { normalizeWord } from "@/utils/normalizeText";
import { wordSocket } from "@/utils/socket";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useReducer, useState } from "react";
import { LayoutChangeEvent, Pressable, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import Animated, { FadeIn } from "react-native-reanimated";
import WordSelectForm from "../Create/components/wordSelectForm";
import { SenseType } from "../data";
import { initialState } from "../type";
import WordAdvanceInformation from "./components/advanceInfomation";
import BasicInformation from "./components/basicInformation";
import WordCollocations from "./components/collocations";
import WordDetailHeader from "./components/header";
import {
  getTranslate,
  isTranslationCompleted,
  mapSenses,
  senseDataReducer,
} from "./utils";

// const DATA: WordType[] = testData;

const WordDetail = () => {
  const { theme } = useTheme();
  const { settings, dbService } = useAppStore();
  const { id, w } = useLocalSearchParams();
  // Prev data: word value + word id [id]?w=...
  const [sensesObj, dispatch] = useReducer(senseDataReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [senses, setSenses] = useState<any>(null);

  // const senses = useMemo(() => {
  //   return mapSenses(sensesObj);
  // }, [sensesObj]);

  useEffect(() => {
    setSenses(mapSenses(sensesObj));
    setIsLoading(sensesObj.isLoading || false);
  }, [sensesObj]);

  // Giả lập nhận dữ liệu từ socket

  const [pageMode, setPageMode] = useState<"view" | "update">("view");
  const [tabIndex, setTabIndex] = useState(0);
  const [currentSense, setCurrentSense] = useState({});

  // const data = useMemo(() => basicWordMapping(DATA), [DATA]);

  const [word, setWord] = useState("table"); // Get from previous page [id]?w

  const toggleLanguageMode = () =>
    dbService?.setShowTranslation(!settings?.show_translation);

  const isFullTranslate = useMemo(() => {
    if (sensesObj.status === "COMPLETED") {
      return isTranslationCompleted(sensesObj);
    }

    return null;
  }, [sensesObj.status]);

  const [socketData, setSocketData] = useState<{data:any, time:number}[]>([]);

  const fetchWord = async (word: string) => {
    const start = new Date().getTime();
    normalizeWord(word);
    const room_id = `${normalizeWord(word, settings?.learning_language)}`;

    if (!settings) return alert("No settings loaded. Please reload the app.");

    wordSocket.subscribe(room_id, (data) => {
      setSocketData((prev) => [
        ...prev,
        { data, time: new Date().getTime() - start },
      ]);
      if (!data.type) {
        console.log("socket không có type", data);
        return;
      }

      dispatch({ type: data.type, payload: data.payload });
    });

    const res = await GetAPI(
      "http://192.168.50.64:8000/api/ai-words/get-word/",
      {
        value: word,
        lang: settings?.learning_language,
        user_lang: settings?.translate_language,
      },
    );

    if (res.data?.status !== 200) {
      dispatch({ type: "INITIAL", payload: res.data });
    } else {
      setSenses(res.data);
    }
  };

  useEffect(() => {
    const handle = async () => {
      await fetchWord("table");
    };
    handle();
  }, []);

  useEffect(() => {
    if (isFullTranslate === false) {
      getTranslate(dispatch);
    }
  }, [isFullTranslate]);

  return (
    <Tabs.Container
      onTabChange={(props) => {
        setTabIndex(props.index);
      }}
      renderHeader={() => (
        <View className="mb-4">
          <WordDetailHeader
            isLoading={sensesObj.isLoading}
            word="Table"
            mode={pageMode}
            setMode={setPageMode}
          />

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
      renderTabBar={(props) => <MaterialTabBar {...props} scrollEnabled />}
    >
      {/* {senses ? ( */}
      {false ? (
        senses.entries.map((item:{pos:string, senses:SenseType[]}, index:number) => {
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
              <Tabs.ScrollView>
                <AppText>{JSON.stringify(item.senses)}</AppText>
                <SensesInfo word={word} data={item.senses} mode={pageMode} />
              </Tabs.ScrollView>
            </Tabs.Tab>
          );
        })
      ) : (
        <Tabs.Tab
          label={() => (
            <AppText
              color={"subText2"}
              font={"MulishMedium"}
              className="w-full items-center justify-center h-10 px-2"
            >
              Loading...
            </AppText>
          )}
          name={tabIndex.toString()}
        >
          <Tabs.ScrollView>
            <AppText>{JSON.stringify(sensesObj)}</AppText>
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
  );
};

type SensesInfoType = {
  word: string;
  data: SenseType[];
  mode?: "create" | "update" | "view";
};
const SensesInfo = (props: SensesInfoType) => {
  const [senseIndex, setSenseIndex] = useState(0);

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
            senseIndex < props.data.length - 1 &&
            setSenseIndex(props.data.length - 1)
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

      <SenseInfo word={props.word} data={activeSense} mode={props.mode} />
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
    <View className="bg-white">
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
          <WordCollocations />
        </View>

        {/* <AppDivider style={{ marginTop: 8, marginBottom: 12 }} /> */}

        <View className="mt-6">
          <WordAdvanceInformation
            related={props.data.metadata?.relateds}
            synonym={props.data.metadata?.synonyms}
            antonym={props.data.metadata?.antonyms}
            form={props.data.metadata?.forms}
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

export default WordDetail;
