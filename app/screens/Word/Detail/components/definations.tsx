import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { BoldText } from "@/components/output/BoldText";
import { FontAwesome } from "@expo/vector-icons";
import { View } from "react-native";
import { Divider } from "react-native-paper";
import { WordType } from "../../data";

type Props = {
  item: WordType["definations"][0];
  languageMode: 1 | 2;
  index: number;
};

const WordDefinations = ({ item, languageMode, index }: Props) => {
  const examples = item.examples;
  const mainDefinition = item.value[0];
  const subDefinitions = item.value.slice(1);

  return (
    <View>
      {index !== 0 && <Divider style={{ marginVertical: 16 }} />}
      <AppText color="subText1">
        <AppIcon
          name={"star"}
          size={12}
          style={{ marginRight: 4 }}
          color="disabled" // "secondary" if choose
          branch="antd"
        />
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

      {examples.length > 0 ? (
        <View className="mt-4 pl-2 gap-4">
          {/* <AppText>Example</AppText> */}
          {examples.map((example, index2) => {
            const origins = example.exampleTranslate;
            const upperCase =
              example.value[0].toUpperCase() + example.value.slice(1);
            return (
              <View key={"a" + index2}>
                <View></View>
                <AppText
                  key={index2}
                  size={"sm"}
                  font="MulishLightItalic"
                  color="primary"
                >
                  <AppText
                    size={"sm"}
                    font="MulishRegularItalic"
                    color="primary"
                  >
                    <AppIcon
                      style={{ transform: [{ scaleX: -1 }] }}
                      color="primary"
                      branch="antd"
                      name={"edit"}
                      size={12}
                    />
                    :
                  </AppText>{" "}
                  <BoldText
                    size={"sm"}
                    color="subText1"
                    boldColor="primary"
                    font="MulishRegularItalic"
                    boldFont="MulishBoldItalic"
                    text={upperCase}
                    bold={example.bold}
                  />
                </AppText>
                {languageMode === 2 && origins.length ? (
                  <View className="mt-1">
                    {[1].map((origin, index3) => {
                      return (
                        <View
                          key={"b" + index3}
                          className="flex-row items-center gap-1"
                        >
                          <FontAwesome
                            name="hand-o-right"
                            size={12}
                            // color={"subText1"}
                          />
                          <AppText
                            key={index3}
                            size={"sm"}
                            font="MulishLightItalic"
                            color="subText1"
                          >
                            {"Test translate"}
                          </AppText>
                        </View>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

export default WordDefinations;
