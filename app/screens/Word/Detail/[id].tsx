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
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useReducer, useState } from "react";
import { LayoutChangeEvent, Pressable, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import Animated, { FadeIn } from "react-native-reanimated";
import WordSelectForm from "../Create/components/wordSelectForm";
import { WordType } from "../data";
import { initialState } from "../type";
import WordAdvanceInformation from "./components/advanceInfomation";
import BasicInformation from "./components/basicInformation";
import WordCollocations from "./components/collocations";
import WordDetailHeader from "./components/header";
import { getSenseData, mapSenses, senseDataReducer } from "./utils";

// const DATA: WordType[] = testData;

const WordDetail = () => {
  const { theme } = useTheme();
  const { id, w } = useLocalSearchParams();
  // Prev data: word value + word id [id]?w=...
  const [sensesObj, dispatch] = useReducer(senseDataReducer, initialState);

  const senses = useMemo(() => {
    return mapSenses(sensesObj);
  }, [sensesObj]);

  // Giả lập nhận dữ liệu từ socket

  const [pageMode, setPageMode] = useState<"view" | "update">("view");
  const [tabIndex, setTabIndex] = useState(0);
  const [languageMode, setLanguageMode] = useState<1 | 2>(1); // hiển thị single lang or 2 lang
  const [currentSense, setCurrentSense] = useState({});

  // const data = useMemo(() => basicWordMapping(DATA), [DATA]);

  const [word, setWord] = useState("table"); // Get from previous page [id]?w

  const toggleLanguageMode = () =>
    setLanguageMode((prev) => (prev === 1 ? 2 : 1));

  useEffect(() => {
    // Connect socket bằng md5 trước khi gọi api
    // Dùng useQuery hoặc fetch ở đây nhe
    // 2 case xử lý
    // Kiểm tra từ vựng trong phạm vi db với status is_Completed nếu true
    // gọi sql trả về theo logic tương tự backend để trả về data hiển thị -> 1.2
    //
    // Khởi tạo socket connect bằng md5 qua funtion có sẵn

    const response: { status: number; message?: string; data: any } = {
      status: 201,
      message: "Processing",
      data: {
        word: { id: "w_table", value: "table" },
        senses: {
          s_1: {
            id: "s_1",
            pos: "noun",
            metadata: { ipa: "/ˈteɪbl/" },
            definition: {
              id: "def_1",
              subId: "s_1",
              languageCode: "en",
              value:
                "A piece of furniture with a flat top and one or more legs.",
              translate:
                "Một món đồ nội thất có mặt phẳng và một hoặc nhiều chân.",
            },
            usage: {
              id: "usg_1",
              subId: "s_1",
              languageCode: "en",
              value: "Commonly used in dining rooms and offices.",
              translate: "Thường dùng trong phòng ăn và văn phòng.",
            },
            translates: ["cái bàn", "mặt bàn"],
            examples: [
              {
                id: "ex_1",
                subId: "s_1",
                languageCode: "en",
                value: "The books are on the table.",
                translate: "Những cuốn sách đang ở trên bàn.",
              },
            ],
          },
        },
        images: {
          s_1: "https://assets.pbimgs.com/pbimgs/rk/images/dp/wcm/202252/0235/modern-farmhouse-round-pedestal-extending-dining-table-l.jpg",
        },
      },
    };

    if (response.status === 200) {
      setTimeout(() => {
        dispatch({ type: "FULLDATA", payload: response.data });
      }, 2000);
      // 1. Từ vựng đã tồn tại (90%) - easy
      // 1.1 Gọi từ vựng
      // 1.2 Hiển thị full dữ liệu -> 3
      // 1.2 Save data -> 3
    } else {
      setTimeout(() => {
        dispatch({
          type: "INITIAL",
          payload: {
            data: response.data,
          },
        });
      }, 2000);
      // 2. Từ vựng chưa tồn tại (10%) - complex
      // 2.1 Gọi từ vựng
      // 2.2 Nhận kết quả chưa tồn tại, nhận dữ liệu liên tục qua socket. show processing status
      getSenseData(dispatch);
      // 2.2.1 Khi bắt đầu gọi, nhận dữ liệu lập tức trong redis nếu có
      // 2.2.2 Mỗi khi có update (sense data, sense image) đều nhận 1 socket path. và update sense state ngay lập tức
      // 2.2.3 sau khi nhận patch cuối cùng với status completed thì tắt processing status -> 3
      // 2.2.4 save data
      // 3. close socket connect
    }
  }, []);

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
            languageMode={languageMode}
            setLanguageMode={setLanguageMode}
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
      {senses ? (
        senses.entries.map((item, index) => {
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
                <SensesInfo
                  word={word}
                  languageMode={languageMode}
                  data={item.senses}
                  mode={pageMode}
                />
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
          <View>
            <AppText>Có nịt</AppText>
          </View>
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
                languageMode={languageMode}
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
  data: WordType[];
  mode?: "create" | "update" | "view";
  languageMode: 1 | 2;
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

      <WordInfo
        word={props.word}
        data={activeSense}
        mode={props.mode}
        languageMode={props.languageMode}
      />
    </View>
  );
};

type WordInfoType = {
  word: string;
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
            word={props.word}
            definition={props.data.definition}
            usage={props.data.usage}
            translates={props.data.translates}
            examples={props.data.examples}
            image={props.data.image}
            note=""
            metadata={props.data.metadata}
            mode={props.mode}
            languageMode={props.languageMode}
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
      <View className="h-10"></View>
    </View>
  );
};

export default WordDetail;
