import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import Selectable from "@/components/input/Selectable";
import WordInput from "@/components/input/wordInput";
import { useTheme } from "@/providers/Theme";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { Divider } from "react-native-paper";
import { testData, WordType } from "../../../data";
import { getList } from "../../../utils/getWordData";
import { basicWordMapping } from "../../../utils/utils";
import WordDefinations from "../../components/definations";
import CreateSenseHeader from "../Components/header";

const DATA = testData;
const tabs = [
  "definations",
  "translates",
  "images",
  "ipas",
  "audios",
  "forms",
  "synonyms",
  "antonyms",
  "relateds",
];

const tabsMapping = {
  definations: (props: DefinationTabsProps) => <DefinationTabs {...props} />,
  translates: (props: TranslateTabsProps) => <TranslateTabs {...props} />,
  images: (props: DefinationTabsProps) => <AppText>image</AppText>,
  ipas: (props: DefinationTabsProps) => <AppText>ipas</AppText>,
  audios: (props: DefinationTabsProps) => <AppText>audios</AppText>,
  forms: (props: DefinationTabsProps) => <AppText>forms</AppText>,
  synonyms: (props: DefinationTabsProps) => <AppText>synonyms</AppText>,
  antonyms: (props: DefinationTabsProps) => <AppText>antonyms</AppText>,
  relateds: (props: DefinationTabsProps) => <AppText>relateds</AppText>,
};

const WordSenseCreate = () => {
  const params = useLocalSearchParams();
  const { wordId, languageMode: defaultLanguageMode, pos } = params;

  const data = useMemo<WordType>(() => {
    const allPos = basicWordMapping(DATA);
    const pos_data = allPos.find((item) => item.wordInfo.pos === pos);
    return pos_data!;
  }, [DATA]);
  const [tabIndex, setTabIndex] = useState(0);
  const [pageMode, setPageMode] = useState<"view" | "update">("view");
  const [languageMode, setLanguageMode] = useState<1 | 2>(defaultLanguageMode);

  const [senseInfo, setSenseInfo] = useState<{ [k: string]: string[] }>({
    definations: [],
    translates: [],
    images: [],
    ipas: [],
    audios: [],
    forms: [],
    synonyms: [],
    antonyms: [],
    relateds: [],
  });

  // get word info full data by id -> get info base on pos

  const [word, setWord] = useState(() => {
    const val = data.value || "";
    return val[0].toUpperCase() + val.slice(1);
  });

  // const pos = "Noun"; // word and pos will pass by id

  return (
    <Tabs.Container
      onTabChange={(props) => {
        setTabIndex(props.index);
      }}
      renderHeader={() => (
        <View className="mb-4">
          <CreateSenseHeader mode={pageMode} setMode={setPageMode} />
          <View className="items-center">
            <WordInput editable={false} value={word} />
            <AppText color="subText2" font={"MulishLightItalic"}>
              ({pos[0].toUpperCase() + pos.slice(1)})
            </AppText>
          </View>

          <View className="px-2 mt-2">
            <AppInput
              placeholder="Sense name / note"
              value=""
              onChangeText={() => {}}
            />
          </View>
        </View>
      )}
      renderTabBar={(props) => <MaterialTabBar {...props} scrollEnabled />}
    >
      {tabs.map((tab, index) => {
        const isActive = index === tabIndex;
        const Tab = tabsMapping?.[tab];
        const onSelect = (id: string, state: boolean) => {
          let list = senseInfo[tab];

          if (state) {
            list.push(id);
          } else {
            list = list.filter((item) => item !== id);
          }
          setSenseInfo({ ...senseInfo, [tab]: list });
        };
        const onSelectAll = (state: boolean) => {
          let selected = senseInfo[tab];
          const list = getList(tab, data);

          if (state === false) {
            setSenseInfo({ ...senseInfo, [tab]: [] });
          } else {
            setSenseInfo({
              ...senseInfo,
              [tab]: list.map((item) => item.id || item.value),
            });
          }
        };

        return (
          <Tabs.Tab
            key={index}
            label={() => (
              <AppText
                color={isActive ? "primary" : "subText2"}
                font={"MulishMedium"}
                className="w-full items-center justify-center h-10 px-2"
              >
                {tab[0].toUpperCase() +
                  tab.slice(1) +
                  (senseInfo?.[tab].length
                    ? ` (${senseInfo?.[tab].length})`
                    : "")}
              </AppText>
            )}
            name={tab}
          >
            <Tabs.ScrollView>
              {/* <WordInfo
                languageMode={languageMode}
                toggleLanguageMode={() =>
                  setLanguageMode((prev) => (prev === 1 ? 2 : 1))
                }
                data={item}
                mode={pageMode}
              /> */}
              <View className="px-2 bg-gray-50">
                <Tab
                  list={getList(tab, data)}
                  onSelectAll={onSelectAll}
                  onSelect={onSelect}
                  items={data?.[tab] || []}
                />
                {/* <DefinationTabs items={data.definations} /> */}
              </View>
            </Tabs.ScrollView>
          </Tabs.Tab>
        );
      })}
    </Tabs.Container>
  );
};

export default WordSenseCreate;

type DefinationTabsProps = {
  list: any[];
  items: WordType["definations"];
  onSelect: (id: string, state: boolean) => void;
  onSelectAll: (state: boolean) => void;
};
const DefinationTabs = ({
  items,
  onSelect,
  onSelectAll,
}: DefinationTabsProps) => {
  const [isSimple, setIsSimple] = useState(true);
  const { theme } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);
  const isSelectedAll = useMemo(() => {
    return selected.length === items.length;
  }, [selected.length, items.length]);

  const handleSelectAll = () => {
    if (isSelectedAll) {
      onSelectAll(false);
      setSelected([]);
    } else {
      onSelectAll(true);
      setSelected(items.map((item) => item.id || item.value));
    }
  };

  const handleSelect = (id: string, state: boolean) => {
    onSelect(id, state);
    if (state) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter((item) => item !== id));
    }
  };

  return (
    <View>
      <View className="flex-row justify-between items-center py-4">
        <View className="w-24">
          <Selectable
            isSelected={isSelectedAll}
            noFill
            onSelect={handleSelectAll}
          >
            <AppText color="primary" font="MulishBold" size={"lg"}>
              All
            </AppText>
          </Selectable>
        </View>

        <AppButton
          onPress={() => setIsSimple(!isSimple)}
          type={isSimple ? "disabled" : "primary"}
          title="Detail"
        />
      </View>
      <View
        className="py-2"
        style={{
          borderTopColor: theme.disabled,
          borderRadius: 8,
        }}
      >
        {items.map((item, index) => (
          <View key={index}>
            <Selectable
              isSelected={selected.includes(item.id || item.value)}
              onSelect={(state) => handleSelect(item.id || item.value, state)}
              key={index}
            >
              <WordDefinations
                key={index}
                item={item}
                index={index}
                languageMode={1}
                isSimple={isSimple}
              />
            </Selectable>

            {index !== items.length - 1 && (
              <Divider style={{ marginVertical: 4 }} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

type TranslateTabsProps = {
  list: any[];
  items: WordType["translates"];
  onSelect: (id: string, state: boolean) => void;
  onSelectAll: (state: boolean) => void;
};
const TranslateTabs = ({
  items,
  onSelect,
  onSelectAll,
}: TranslateTabsProps) => {
  const [isSimple, setIsSimple] = useState(true);
  const { theme } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);
  const isSelectedAll = useMemo(() => {
    return selected.length === items.length;
  }, [selected.length, items.length]);

  const handleSelectAll = () => {
    if (isSelectedAll) {
      onSelectAll(false);
      setSelected([]);
    } else {
      onSelectAll(true);
      setSelected(items.map((item) => item.id || item.value));
    }
  };

  const handleSelect = (id: string, state: boolean) => {
    onSelect(id, state);
    if (state) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter((item) => item !== id));
    }
  };

  return (
    <View>
      <View className="flex-row justify-between items-center py-4">
        <View className="w-24">
          <Selectable
            isSelected={isSelectedAll}
            noFill
            onSelect={handleSelectAll}
          >
            <AppText color="primary" font="MulishBold" size={"lg"}>
              All
            </AppText>
          </Selectable>
        </View>

        <AppButton
          onPress={() => setIsSimple(!isSimple)}
          type={isSimple ? "disabled" : "primary"}
          title="Detail"
        />
      </View>
      <View
        className="py-2"
        style={{
          borderTopColor: theme.disabled,
          borderRadius: 8,
        }}
      >
        {items.map((item, index) => (
          <View key={index}>
            <Selectable
              isSelected={selected.includes(item.id || item.value)}
              onSelect={(state) => handleSelect(item.id || item.value, state)}
              key={index}
            >
              <AppText>{item.value}</AppText>
            </Selectable>

            {index !== items.length - 1 && (
              <Divider style={{ marginVertical: 4 }} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};
