import AppButton from "@/components/AppButton";
import AppCheckbox from "@/components/AppCheckbox";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppSearch from "@/components/input/AppSearch";
import WordListSuggestion from "@/components/WordListSugesstion";
import { useDebounce } from "@/hooks/useDebouce";
import { useTheme } from "@/providers/Theme";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";
import Animated, { SlideInLeft, SlideOutLeft } from "react-native-reanimated";
import WordSearchItem from "./wordSearchItem";

export type STATUS =
  | "LOADING"
  | "INITIAL"
  | "PENDING"
  | "PARTIAL"
  | "COMPLETED";
export type Sense = {
  //Simple sense to show to user, if click detail => detail page
  data?: {
    definition: {
      value: string;
      translate: string;
    };
    id: string;
    isNew?: boolean;
  };
  status: STATUS;
  wordId: string;
  wordValue: string;
};
type Word = {
  id: string;
  status?: STATUS;
  selectedSense?: Sense[];
  value: string;
  // senses: Sense[];
};

type SenseInfo = {
  value: string;
  id: string;
  senses?: Sense[];
  selectedSense?: string[]; // Cùng 1 từ có thể chọn nhiều sense và hiển thị distinct word value. Trong list thì không
};

export type SearchSuggestion = {
  id: string;
  value: string;
  status?: STATUS;
  image?: string;
  data?: SenseInfo;
  senses?: Sense[];
  selectedSense?: Sense[];
  isNew?: boolean;
};

export type WordList = {
  id: string;
  value: string;
  isNew?: boolean;
  status: STATUS;
  isError?: boolean;
  haveChange?: boolean;
  senses?: Sense[];
  selectedSense?: string[];
};

const searchResult: SearchSuggestion[] = [
  { id: "1", value: "test" },
  { id: "2", value: "test2" },
  { id: "3", value: "test3" },
  { id: "4", value: "test4" },
  { id: "5", value: "test5" },
  { id: "6", value: "test6" },
  { id: "7", value: "test7" },
  { id: "8", value: "test8" },
  { id: "9", value: "test9" },
  { id: "10", value: "test10" },
];

type Props = {
  initialSenses?: Sense[];
};

const WordSelectForm = (props: Props) => {
  const { theme } = useTheme();

  // Các sense được chọn
  const [senses, setSenses] = useState<Sense[]>(props.initialSenses || []);
  const order = useMemo<string[]>(() => {
    const ids: string[] = [];
    const idSet = new Set<string>();

    senses.forEach((item) => {
      if (!idSet.has(item.wordId)) {
        idSet.add(item.wordId);
        ids.push(item.wordId);
      }
    });
    return ids;
  }, [senses]);

  // Chứa tất cả các sense, chỉ để cache nếu người ta reselect word
  const [wordSense, setWordSense] = useState<
    Map<string, { status: STATUS; senses: Sense[] }>
  >(new Map());

  // Thằng này nó chỉ lưu được các giá trị hiện có chứ không lưu kết quả từ server trả về
  const wordList = useMemo(() => {
    const map = new Map<string, Word>();
    senses.forEach((sense) => {
      if (!map.has(sense.wordId)) {
        if (sense.data) {
          map.set(sense.wordId, {
            value: sense.wordValue,
            id: sense.wordId,
            selectedSense: [sense],
            status: sense.status,
          });
        } else {
          map.set(sense.wordId, {
            value: sense.wordValue,
            id: sense.wordId,
            status: sense.status,
          });
        }
      } else {
        const word = map.get(sense.wordId);
        if (!sense.data) {
          return;
        }
        word?.selectedSense?.push(sense);
      }
    });

    return map;
  }, [senses]);

  const displayList = useMemo(() => {
    return order.map((id) => wordList.get(id)!);
  }, [order, wordList]);

  const [focusing, setFocusing] = useState(false);
  const { width, height } = useWindowDimensions();

  const [searchVal, setSearchVal] = useState<string>("");
  const appSearchRef = useRef<TextInput>(null);
  const [selectedWord, setSelectedWord] = useState<string | undefined[]>([]);
  const [editMode, setEditMode] = useState(false);

  const searchDebounced = useDebounce(searchVal);
  const [searchSuggestion, setSearchSuggestion] = useState<SearchSuggestion[]>(
    [],
  );

  // Hàm gọi query các word đang tồn tại trong server

  const handleSearchResult = (
    searchResult: {
      id: string;
      value: string;
      senses?: Sense[];
      selectedSenses?: Sense[];
    }[],
  ) => {
    let suggestData: SearchSuggestion[] = [];
    let isExist = false;
    searchResult.forEach((item) => {
      const tempData = { ...item };
      if (item.value.toLowerCase() === searchDebounced.toLowerCase()) {
        isExist = true;
      }

      tempData.selectedSenses = wordList.get(item.id)?.selectedSense || [];

      if (senses) wordSense.set(item.id, { status: "COMPLETED", senses });

      suggestData.push(tempData);
    });

    if (!isExist) {
      suggestData = [
        { value: searchDebounced, isNew: true, id: searchDebounced }, // id:searchDebounced +'_'+ language
        ...suggestData,
      ];
    }
    setSearchSuggestion(suggestData);
  };

  useEffect(() => {
    const wordSenseMap = new Map<string, { status: STATUS; senses: Sense[] }>();
    senses.forEach((item) => {
      const wordSense = wordSenseMap.get(item.wordId);
      if (wordSense) {
        wordSense.senses.push(item);
      } else {
        wordSenseMap.set(item.wordId, { status: "PARTIAL", senses: [item] });
      }
    });
    setWordSense(wordSenseMap);
  }, []);

  useEffect(() => {
    handleSearchResult(searchResult);
  }, [searchResult, searchDebounced]);

  const selectSugession = (id: string) => {
    setSearchVal("");
    const word = searchSuggestion.find((item) => item.id === id);
    if (!word) return;

    const existing = wordList.get(word.id);
    if (existing) {
      // Kiểm tra status của nó
      const status = existing.status;

      switch (status) {
        case "LOADING":
          // Call api và hiển thị form
          return;
        case "INITIAL":
          // toast nhẹ thông báo đang load
          return;
        case "PENDING":
          // Hiển thị form sense select
          return;
        case "COMPLETED":
          // Hiển thị form sense select
          return;

        default:
          break;
      }
    } else {
      const newWordSense = new Map(wordSense);
      if (word.isNew) {
        setSenses((prev) => [
          { wordId: word.id, wordValue: word.value, status: "INITIAL" },
          ...prev,
        ]);
        newWordSense.set(word.id, { ...word, status: "INITIAL", senses: [] });
        return;
      } else {
        newWordSense.set(word.id, {
          ...word,
          status: "PARTIAL",
          senses: word.data?.senses || [],
        });

        // Ping thấp thì partial và hiển thị luôn popup add senses trong popup
        // Ping cao LOADING và background api, add sense rỗng để hiện word ra list. có api res thì update sense và cho thành pending
        // Cân nhắc gọi full sense với pos + definitons only, preview_image hên xui, translate nếu có
        // Socket translate nếu cần
        // api gọi word info Hiện wor
        setWordSense(newWordSense);
        return;
      }
    }
  };

  const [checkList, setCheckList] = useState<Set<string>>(new Set<string>());
  const isCheckAll = useMemo(() => {
    return checkList.size === displayList.length;
  }, [checkList]);

  const checkWord = (id?: string) => {
    if (id) {
      const newList = new Set(checkList);

      newList.add(id);
      setCheckList(newList);
    }
  };

  const uncheckWord = (id?: string) => {
    if (id) {
      const newList = new Set(checkList);

      newList.delete(id);
      setCheckList(newList);
    }
  };

  const checkAll = () => {
    const newList = new Set<string>(order);
    setCheckList(newList);
  };

  const uncheckAll = () => {
    setCheckList(new Set<string>());
  };

  const removeWord = (id: string[]) => {
    const idSet = new Set<string>(id);
    const newMap = new Map(wordList);
    id.forEach((item) => {
      newMap.delete(item);
    });

    const newSense = [...senses].filter((item) => !idSet.has(item.wordId));
    setSenses(newSense);
    const newOrder = order.filter((item) => !idSet.has(item));
  };

  return (
    <View className="h-full w-full">
      <View className="px-4 justify-end flex-row items-center gap-2 pt-2">
        {/* <View className="h-8"> */}
        {/* <FlatList
          style={{
            paddingVertical: 12,
            flex: 1,
            borderRadius: 8,
          }}
          data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          renderItem={({ item, index }) => <TagItem key={index} />}
          horizontal
          // showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            paddingRight: 8,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
          }}
        /> */}
        {/* <ScrollView horizontal className="gap-2 bg-red-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <TagItem key={index} />
            ))}
          </ScrollView> */}
        {/* </View> */}

        {/* <View
          style={{ borderRightWidth: 0.5, borderColor: "gray", height: 32 }}
        ></View> */}

        <AppButton type="primary" onPress={() => {}}>
          <AppText color="white">Save</AppText>
        </AppButton>
      </View>

      <View className="px-4 mt-3">
        <AppSearch
          autofocus
          ref={appSearchRef}
          onFocus={() => {
            setFocusing(true);
          }}
          onBlur={() => setFocusing(false)}
          value={searchVal}
          onChangeText={setSearchVal}
        />

        <View className="px-4">
          <WordListSuggestion
            show={!!searchVal && searchSuggestion.length > 0 && focusing}
            itemStyle={{ paddingLeft: 44 }}
            words={searchSuggestion}
            onSelect={(val) => {
              selectSugession(val);
            }}
          />
        </View>
      </View>

      {/* <View className="flex-1"> */}
      <View className="flex-1 mt-6">
        <ScrollView className="px-4" keyboardShouldPersistTaps="handled">
          <View>
            {displayList.length === 0 ? (
              <View className="mt-6 items-center justify-center">
                <View
                  style={{ width: width / 2, height: width / 2 }}
                  className="bg-red-200 rounded-lg"
                >
                  <AppText className="text-center">Empty Image</AppText>
                </View>
                <AppText
                  className="mt-4"
                  font="MulishRegularItalic"
                  color="subText2"
                >
                  Let's add your first word
                </AppText>
              </View>
            ) : (
              <View>
                <View className="items-center flex-row justify-between pl-2 mb-2 h-8">
                  {editMode ? (
                    <Animated.View
                      entering={SlideInLeft}
                      exiting={SlideOutLeft}
                      className="flex-row gap-4"
                    >
                      <AppCheckbox
                        checked={isCheckAll}
                        onChange={isCheckAll ? uncheckAll : checkAll}
                      />
                      <AppButton
                        type="error"
                        size="xs"
                        onPress={() => setEditMode(false)}
                        title="Delete"
                      />
                    </Animated.View>
                  ) : (
                    <View></View>
                  )}
                  {selectedWord.length > 0 && (
                    <AppText size={"sm"} font="MulishBold" color="subText2">
                      {selectedWord.length} words selected
                    </AppText>
                  )}
                  <View className="flex-row items-center gap-1">
                    {editMode && (
                      <>
                        <AppIcon
                          onPress={() => {
                            uncheckAll();
                            setEditMode(false);
                          }}
                          size={18}
                          color={theme.error}
                          name={"x-circle"}
                          branch="feather"
                        />
                        <AppText
                          className="text-center"
                          size={"sm"}
                          font="MulishBold"
                          color="success"
                        >
                          {checkList.size}/
                        </AppText>
                      </>
                    )}
                    <AppText
                      className="text-center"
                      size={"sm"}
                      font="MulishBold"
                      color="subText2"
                    >
                      {displayList.length} word(s)
                    </AppText>
                  </View>
                </View>

                <Divider
                  style={{ height: 2, opacity: 0.6, borderRadius: 999 }}
                />
              </View>
            )}

            <View className="gap-1 mt-4">
              {displayList.map((word, index) => {
                const isChecked = checkList.has(word.id);

                return (
                  <View key={"new-" + word.id}>
                    <WordSearchItem
                      checked={isChecked}
                      onSelect={checkWord}
                      onDismiss={uncheckWord}
                      editMode={editMode}
                      startEditMode={() => setEditMode(true)}
                      word={word}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
      {/* </View> */}
    </View>
  );
};

const TagItem = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{ backgroundColor: theme.primary + "10" }}
      className="px-3 py-1 rounded-full h-8 items-center justify-center"
    >
      <AppText size={"xs"}>Test tag</AppText>

      <View className="absolute -top-1 -right-1">
        <AppIcon
          branch="antd"
          name="closecircle"
          color={theme.error + "80"}
          size={14}
        />
      </View>
    </View>
  );
};

export default WordSelectForm;
