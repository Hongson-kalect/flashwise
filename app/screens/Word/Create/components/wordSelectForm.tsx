import AppButton from "@/components/AppButton";
import AppCheckbox from "@/components/AppCheckbox";
import { AppDivider } from "@/components/AppDivider";
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

type Sense = {
  //Simple sense to show to user, if click detail => detail page
  definition: {
    value: string;
    translate: string;
  };
  id?: string;
  wordId?: string;
  wordValue?: string;
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
  data?: SenseInfo;
  isNew?: boolean;
};

export type WordList = {
  id: string;
  value: string;
  isNew?: boolean;
  status: "LOADING" | "INITIAL" | "PENDING" | "PARTIAL" | "COMPLETED";
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
  const [focusing, setFocusing] = useState(false);
  const { width, height } = useWindowDimensions();
  const [wordList, setWordList] = useState<Map<string, WordList>>(new Map());
  const [order, setOrder] = useState<string[]>([]);
  const displayList = useMemo(() => {
    return order.map((id) => ({
      ...wordList.get(id)!,
      id,
    }));
  }, [wordList]);

  const [searchVal, setSearchVal] = useState<string>("");
  const [existingWord, setExistingWord] = useState<SenseInfo[]>([]);
  const [newWord, setNewWord] = useState<SenseInfo[]>([]);
  const appSearchRef = useRef<TextInput>(null);
  const [selectedWord, setSelectedWord] = useState<string | undefined[]>([]);
  const [editMode, setEditMode] = useState(false);

  const wordMap = useMemo(() => {
    const res = new Map<string, SenseInfo>();
    existingWord.forEach((item) => {
      res.set(item.value, item);
    });
    return res;
  }, [existingWord]);

  const searchDebounced = useDebounce(searchVal);
  const [searchSuggestion, setSearchSuggestion] = useState<SearchSuggestion[]>(
    [],
  );

  // Hàm gọi query các word đang tồn tại trong server

  const handleSearchResult = (
    searchResult: { id: string; value: string; data?: SenseInfo }[],
  ) => {
    let suggestData: SearchSuggestion[] = [];
    let isExist = false;
    searchResult.forEach((item) => {
      const tempData = { ...item };
      if (item.value.toLowerCase() === searchDebounced.toLowerCase()) {
        isExist = true;
      }

      if (wordMap.has(item.value)) {
        const existing = wordMap.get(item.value);
        tempData.data = existing;
      }

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
    // Nạp danh sách word trong lần đầu để hiển thị các từ đang có trong list với isNew = false
    if (props.initialSenses) {
      const wordList = new Map<string, WordList>();
      props.initialSenses.forEach((item) => {
        if (item.wordId && item.id && item.wordValue) {
          const word = wordList.get(item.wordId);
          if (!word)
            wordList.set(item.wordId, {
              id: item.wordId,
              value: item.wordValue,
              isNew: false,
              status: "COMPLETED",
              senses: [item],
            });
          else {
            word?.senses?.push(item);
            wordList.set(item.wordId, { ...word });
          }
        }
      });
      setWordList(wordList);
    }
  });

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
      if (word.isNew) {
        const newWordList = new Map(wordList);
        newWordList.set(word.id, { ...word, status: "INITIAL" });
        setWordList(newWordList);
        setOrder([word.id, ...order]);
        return;
      } else {
        // Case suggest không có data
        // api call data và hiển thị form. select và ok thì thêm vào word list.
        // chưa có api, tạm thêm với sense []
        const newWordList = new Map(wordList);
        newWordList.set(word.id, { ...word, status: "PENDING", senses: [] });
        setWordList(newWordList);
        setOrder([word.id, ...order]);
        return;
      }
    }
  };

  const [checkList, setCheckList] = useState<Set<string>>(new Set<string>());
  const isCheckAll = useMemo(() => {
    return checkList.size === displayList.length;
  }, [checkList, newWord, existingWord]);

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
    setWordList(newMap);
    const newOrder = order.filter((item) => !idSet.has(item));
    setOrder(newOrder);
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
            wordSet={wordList}
            show={!!searchVal && searchSuggestion.length > 0 && focusing}
            itemStyle={{ paddingLeft: 44 }}
            options={searchSuggestion.map((item) => ({
              label: item.value,
              value: item.id,
            }))}
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
            {displayList.length === 0 && newWord.length === 0 ? (
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
                    {(index !== newWord.length - 1 ||
                      existingWord.length > 0) && <AppDivider />}
                  </View>
                );
              })}
              {existingWord.map((word, index) => {
                const isChecked = checkList.has(word.id);
                return (
                  <View key={"existing-" + word.id}>
                    <WordSearchItem
                      checked={isChecked}
                      onSelect={checkWord}
                      onDismiss={uncheckWord}
                      editMode={editMode}
                      startEditMode={() => setEditMode(true)}
                      word={word}
                    />
                    {index !== existingWord.length - 1 && <AppDivider />}
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
