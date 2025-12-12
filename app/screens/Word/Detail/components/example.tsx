import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { BoldText } from "@/components/output/BoldText";
import { useTheme } from "@/providers/Theme";
import { FontAwesome } from "@expo/vector-icons";
import { View } from "react-native";

type Props = {
  bold: number[][] | string;
  example: string;
  translates: string[];
  languageMode: 1 | 2;
};
const WordExample = ({ example, languageMode, translates, bold }: Props) => {
  const upperCase = example[0].toUpperCase() + example.slice(1);
  const { theme } = useTheme();
  return (
    <View>
      <AppText size={"sm"} font="MulishLightItalic" color="primary">
        {/* <AppText size={"sm"} font="MulishRegularItalic" color="primary"> */}
        <AppIcon
          style={{ transform: [{ scaleX: -1 }] }}
          color="primary"
          branch="antd"
          name={"edit"}
          size={12}
        />
        {" : "}
        {/* </AppText> */}
        <BoldText
          size={"sm"}
          color="subText1"
          boldColor="primary"
          font="MulishRegularItalic"
          boldFont="MulishBoldItalic"
          text={upperCase}
          bold={bold}
        />
      </AppText>
      {languageMode === 2 && translates.length ? (
        <View className="mt-1">
          {translates.length ? (
            translates.map((translate, index3) => {
              return (
                <AppText
                  key={"b" + index3}
                  className="flex-row items-center gap-2"
                >
                  <FontAwesome
                    color={theme.primary}
                    name="hand-o-right"
                    className="mr-2"
                    size={12}
                  />
                  {" : "}
                  <AppText
                    key={index3}
                    size={"sm"}
                    font="MulishRegularItalic"
                    color="subText2"
                  >
                    {translate}
                  </AppText>
                </AppText>
              );
            })
          ) : (
            <View className="flex-row items-center gap-1">
              <FontAwesome name="hand-o-right" size={12} />
              <AppText size={"sm"} font="MulishLightItalic" color="subText2">
                Chưa có bản dịch nào
              </AppText>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
};
export default WordExample;
