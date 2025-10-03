import AppButton from "@/components/AppButton";
import AppCheckbox from "@/components/AppCheckbox";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import AppSearch from "@/components/input/AppSearch";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { useEffect, useState } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import WordSelectForm from "../../Word/Create/components/wordSelectForm";
import WordListItem from "../../Word/List/components/listItem";

type Props = {
  readonly?: boolean;
};
const CollectionWordList = (props: Props) => {
  const [isSelectingWord, setIsSelectingWord] = useState(false);
  const [selectedWord, setSelectedWord] = useState<number[]>([]);
  const { theme } = useTheme();
  const { present } = useBottomSheet();

  const handleOpenBottomSheet = () => {
    present({
      render: () => <WordSelectForm />,
      title: "Add word",
      size: "full",
    });
  };

  const handleCancel = () => {
    setIsSelectingWord(false);
    setSelectedWord([]);
  };

  useEffect(() => {
    if (selectedWord.length > 0 && !isSelectingWord) {
      setIsSelectingWord(true);
    }

    if (selectedWord.length === 0 && isSelectingWord) {
      setIsSelectingWord(false);
    }
  }, [selectedWord]);

  return (
    <>
      <View className="flex-row items-center justify-between">
        <AppTitle title="Word list" />
        {props.readonly ? (
          isSelectingWord ? (
            <AppButton
              onPress={() => {
                handleOpenBottomSheet();
              }}
              type={"error"}
              size="sm"
            >
              <AppIcon branch="antd" name="delete" color="white" size={18} />
              <AppText color="white">Delete</AppText>
            </AppButton>
          ) : (
            <AppButton
              onPress={() => {
                handleOpenBottomSheet();
              }}
              type={"primary"}
              size="sm"
            >
              <AppIcon branch="antd" name="plus" color="white" size={18} />
              <AppText color="white">Add</AppText>
            </AppButton>
          )
        ) : null}
      </View>

      {/* <View className="flex-row items-center h-16">
                  <View
                    style={{ backgroundColor: theme.primary + "20" }}
                    className="px-2 py-1 rounded-lg"
                  >
                    <AppText color="subText1" size={"xs"}>
                      Tag 1
                    </AppText>
                  </View>
                </View> */}
      <View className="mt-4">
        <AppSearch />
      </View>

      <View className="flex-row items-center justify-between mt-8 ml-1 h-10">
        {isSelectingWord ? (
          <>
            <TouchableOpacity className="flex-row items-center gap-2">
              <AppCheckbox checked={false} scale={1} />

              <AppText font="MulishMedium">200 seleted</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-1 px-2 py-1 rounded-lg"
              style={{ backgroundColor: theme.disabled }}
              onPress={handleCancel}
            >
              <AppIcon branch="antd" name="close" color="white" size={16} />
              <AppText size={"sm"} color="white" font="MulishMedium">
                Cancel
              </AppText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <AppText font="MulishMedium">200 card(s)</AppText>
            <AppText color="subText2" size={"sm"}>
              Sắp xếp:{" "}
              <AppText
                size={"sm"}
                style={{ textDecorationLine: "underline" }}
                color="link"
                font="MulishMediumItalic"
              >
                Chữ cái
              </AppText>
            </AppText>
          </>
        )}
      </View>

      <View className="mt-4 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Pressable key={index} className="flex-row items-center gap-2">
            {isSelectingWord && (
              <Animated.View
                // entering={FadeIn}
                // exiting={FadeOut}
                className={"absolute top-2 left-2 z-10"}
              >
                <AppCheckbox checked={true} scale={1.4} />
              </Animated.View>
            )}
            <Animated.View
              className={"flex-1"}
              style={{
                borderColor: isSelectingWord ? theme.primary : "transparent",
                borderWidth: 1,
                borderRadius: 8,
              }}
              layout={LinearTransition.springify().mass(0.5)}
            >
              <WordListItem
                disabled={isSelectingWord}
                onLongPress={
                  props.readonly ? () => setSelectedWord([1]) : () => {}
                }
                key={index}
              />
            </Animated.View>
          </Pressable>
        ))}
      </View>
    </>
  );
};

export default CollectionWordList;
