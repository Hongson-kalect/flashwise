import {
  SearchSuggestion,
  Sense,
} from "@/app/screens/Word/Create/components/wordSelectForm";
import { useTheme } from "@/providers/Theme";
import React from "react";
import {
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AppDivider } from "./AppDivider";
import AppText from "./AppText";

type Props = {
  onSelect: (val: string) => void;
  show?: boolean;
  itemStyle?: ViewStyle;
  words: SearchSuggestion[];
  searchVal?: string;
  // options: { label: string | React.ReactNode; value: string }[];
};
const WordListSuggestion = (props: Props) => {
  const { theme } = useTheme();
  const { height } = useWindowDimensions();
  const [selectedSense, setSelectedSense] = React.useState<string[]>([]);

  // Data để show cái nào đang select, status có ok hay chưa
  // Loading, init, done

  const handlePress = (
    value: string,
    status?: "LOADING" | "INITIAL" | "PENDING" | "PARTIAL" | "COMPLETED",
    selected?: Sense[],
    allSenses?: Sense[],
  ) => {
    if (!status) props.onSelect(value);
    else if (status === "COMPLETED" || status === "PARTIAL") {
      alert("Hiện model sense select");
      // show modal lên
    } else if (status === "LOADING" || status === "INITIAL") {
      alert("loading");
      //toast nhẹ là đợi chờ là hạnh phúc
    }
  };

  if (!props.show) return null;
  return (
    <Animated.View
      entering={FadeInDown}
      className="absolute"
      style={{
        backgroundColor: theme.background,
        elevation: 4,
        shadowColor: theme.text,
        top: "100%",
        marginTop: 4,
        left: 0,
        right: 0,
        zIndex: 9999,
        borderRadius: 24,
      }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{ maxHeight: height / 3 }}
      >
        {props?.searchVal && (
          <>
            <TouchableOpacity
              style={props.itemStyle}
              onPress={() => handlePress(props?.searchVal || "")}
              className="px-2 h-14 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-2">
                <View
                  style={{ width: 42 }}
                  className="items-center justify-center"
                >
                  {/* status color, icon, image,...d */}
                  <View
                    style={{ height: 28, width: 28 }}
                    className="bg-gray-400 rounded-full"
                  ></View>
                </View>
                {/* <View
                  style={{ height: 36, width: 64 }}
                  className="bg-gray-400 rounded "
                ></View> */}
                <AppText numberOfLines={1}>{props.searchVal}</AppText>
              </View>
            </TouchableOpacity>
            {props.words.length > 0 && <Divider />}
          </>
        )}
        {props.words.map(
          ({ id, value, image, status, selectedSense, senses }, index) => {
            const isLast = index === props.words.length - 1;
            // const status = wordData?.status;

            return (
              <View key={index}>
                <View>
                  <TouchableOpacity
                    style={props.itemStyle}
                    onPress={() =>
                      handlePress(value, status, selectedSense, senses)
                    }
                    className="px-2 h-14 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-2">
                      <View
                        style={{ width: 42 }}
                        className="items-center justify-center"
                      >
                        <View
                          style={{ height: 28, width: 28 }}
                          className="bg-gray-400 rounded-full"
                        ></View>
                      </View>
                      <AppText>{value}</AppText>
                    </View>

                    <View>
                      <AppText>{status || "None"}</AppText>
                      {/* Lấy được data, có thể hiện sense đã chọn hay chưa, init, disabled
                     Chỉnh màu nền, viền,... */}
                    </View>
                  </TouchableOpacity>
                  {!isLast && <AppDivider />}
                </View>
              </View>
            );
          },
        )}
      </ScrollView>
    </Animated.View>
  );
};

export default WordListSuggestion;
