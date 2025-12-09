import AppText from "@/components/AppText";
import WordInput from "@/components/input/wordInput";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { testData } from "../../../data";
import { basicWordMapping } from "../../../utils/utils";
import CreateSenseHeader from "../Components/header";

const DATA = testData;
const tabs = [
  "definations",
  //   "examples",
  "translations",
  "image",
  "ipas",
  "audios",
  "forms",
  "synonyms",
  "antonyms",
  "relateds",
];
const WordSenseCreate = () => {
  const data = useMemo(() => basicWordMapping(DATA), [DATA]);
  const [tabIndex, setTabIndex] = useState(0);
  const [pageMode, setPageMode] = useState<"view" | "update">("view");
  const [languageMode, setLanguageMode] = useState<1 | 2>(1);

  const [word, setWord] = useState(() => {
    const val = data[0].value || "";
    return val[0].toUpperCase() + val.slice(1);
  }, []);

  const pos = "Noun"; // word and pos will pass by id

  return (
    <Tabs.Container
      onTabChange={(props) => {
        setTabIndex(props.index);
      }}
      renderHeader={() => (
        <View className="mb-4">
          <CreateSenseHeader mode={pageMode} setMode={setPageMode} />
          <WordInput editable={false} value={word} />
          <AppText color="subText2" font={"MulishMedium"}>
            {"Noun"}
          </AppText>
        </View>
      )}
      renderTabBar={(props) => <MaterialTabBar {...props} scrollEnabled />}
    >
      {tabs.map((tab, index) => {
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
                {tab[0].toUpperCase() + tab.slice(1)}
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
              <AppText>{tab}</AppText>
            </Tabs.ScrollView>
          </Tabs.Tab>
        );
      })}
    </Tabs.Container>
  );
};

export default WordSenseCreate;
