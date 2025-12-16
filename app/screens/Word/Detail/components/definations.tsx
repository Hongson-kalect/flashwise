import AppText from "@/components/AppText";
import { View, ViewStyle } from "react-native";
import { WordType } from "../../data";
import WordExample from "./example";

type Props = {
  item: WordType["definations"][0];
  languageMode: 1 | 2;
  index: number;
  isSimple?: boolean;
  word: string;
  style?: ViewStyle;
};

const WordDefinations = ({
  item,
  languageMode,
  index,
  isSimple,
  word,
  style,
}: Props) => {
  const examples = item.examples;
  const mainDefinition = item.value[0];
  const subDefinitions = item.value.slice(1);

  return (
    <View className="py-3" style={style}>
      {/* {index !== 0 && <Divider style={{ marginVertical: 16 }} />} */}
      <AppText color="subText1">
        {/* {!isSimple && (
          <AppIcon
            name={"star"}
            size={12}
            style={{ marginRight: 4 }}
            color="disabled" // "secondary" if choose
            branch="antd"
          />
        )} */}
        {mainDefinition[0].toUpperCase()}
        {mainDefinition.slice(1)}
      </AppText>

      {subDefinitions.length > 0 ? (
        <View className="mt-1.5">
          {subDefinitions.map((subDefinition, index2) => {
            return (
              <View key={"sub-" + index2}>
                <AppText
                  key={index2}
                  size={"sm"}
                  font="MulishLight"
                  color="subText1"
                >
                  {subDefinition[0].toUpperCase()}
                  {subDefinition.slice(1)}
                </AppText>
              </View>
            );
          })}
        </View>
      ) : null}

      {!isSimple && examples.length > 0 ? (
        <View className="mt-4 pl-2 gap-4">
          {/* <AppText>Example</AppText> */}
          {examples.map((example, index2) => {
            const translates = example.exampleTranslate;
            const exampleText =
              example.value[0].toUpperCase() + example.value.slice(1);

            return (
              <WordExample
                translates={translates}
                bold={example.bold}
                example={exampleText}
                languageMode={languageMode}
                key={"a" + index2}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

export default WordDefinations;
