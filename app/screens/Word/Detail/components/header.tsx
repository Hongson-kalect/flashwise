import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { Dispatch, SetStateAction, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import CreateSenseSheet, { SenseType } from "./createSenseSheet";

type Props = {
  mode?: "create" | "update" | "view";
  setMode: Dispatch<SetStateAction<"update" | "view">>;
  languageMode: 1 | 2;
  toggleLanguageMode: () => void;
};
const WordDetailHeader = ({
  mode,
  setMode,
  languageMode,
  toggleLanguageMode,
}: Props) => {
  const { theme } = useTheme();
  const { present } = useBottomSheet();

  // just use temp. buttom sheet will change this value while editing
  const [tempSenseValue, setTempSenseValue] = useState<SenseType>({
    id: new Date().getTime().toString(),
    defination: "",
    traslatedDefination: "",
    translations: [],
    examples: [],
  });

  const handleAddSense = () =>
    present({
      title: "(n) Tip",
      size: "full",
      render: () => (
        <CreateSenseSheet
          word="tip"
          handleAddSense={() => {}}
          senseValue={tempSenseValue}
          setSenseValue={setTempSenseValue}
          languageMode={languageMode}
          toggleLanguageMode={toggleLanguageMode}
        />
      ),
    });
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        // title="Detail"
        rightElement={
          <View className="flex-row gap-2 items-center">
            {mode === "view" ? (
              <View
              // exiting={SlideOutDown}
              >
                <Pressable onPress={toggleLanguageMode}>
                  <Animated.View
                    className="items-center justify-center"
                    layout={LinearTransition}
                    style={[
                      {
                        backgroundColor: theme.background,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        height: 36,
                        width: 36,
                      },
                      languageMode === 2
                        ? styles.frontFlagPosition
                        : styles.backFlagPosition,
                    ]}
                  >
                    <AppText>VI</AppText>
                  </Animated.View>
                  <Animated.View
                    className={"h-8 w-8 items-center justify-center"}
                    layout={LinearTransition}
                    style={[
                      {
                        backgroundColor: theme.background,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        height: 36,
                        width: 36,
                      },
                      languageMode !== 2
                        ? styles.frontFlagPosition
                        : styles.backFlagPosition,
                    ]}
                  >
                    <AppText>EN</AppText>
                  </Animated.View>
                </Pressable>
              </View>
            ) : (
              <View
              // exiting={SlideOutDown}
              >
                <AppButton
                  style={{ minWidth: 0, paddingHorizontal: 10 }}
                  type="error"
                  outline
                  title="Delete"
                  onPress={() => {}}
                  // Delete user word only, user never can delete official word
                >
                  <AppIcon
                    name="trash"
                    branch="feather"
                    size={20}
                    color="error"
                  />
                  {/* <AppText color="white">Delete</AppText> */}
                </AppButton>
              </View>
            )}

            <Animated.View
              className={"h-8 w-8 items-center justify-center"}
              layout={LinearTransition}
              style={[
                {
                  backgroundColor: theme.background,
                  borderWidth: 0.5,
                  // borderColor: theme.secondary,
                  borderRadius: 5,
                  height: 40,
                  width: 40,
                },
              ]}
            >
              <AppIcon
                name="edit"
                branch="antd"
                size={20}
                // color={theme.secondary}
              />
            </Animated.View>

            <View className="flex-row gap-2">
              {/* <AppButton
                onPress={() => {
                  setMode((prev) => (prev === "view" ? "update" : "view"));
                }}
                type={mode === "view" ? "primary" : "success"}
                style={{ minWidth: 0 }}
                outline
              >
                <AppIcon
                  name={mode === "view" ? "copy" : "list"}
                  branch="fa6"
                  size={18}
                  color="primary"
                />
              </AppButton> */}

              <AppButton
                onPress={() => {
                  // router.push(`/screens/Word/Update/${1}`);
                  handleAddSense();
                  // setMode((prev) => (prev === "view" ? "update" : "view"));
                }}
                type={mode === "view" ? "primary" : "success"}
              >
                <AppIcon name={"plus"} branch="antd" size={18} color="white" />
                <AppText color="white">Sense</AppText>
              </AppButton>
            </View>
          </View>
        }
      />
    </View>
  );
};

export default WordDetailHeader;

const styles = StyleSheet.create({
  backFlagPosition: {
    position: "absolute",
    left: -6,
    top: -6,
    // zIndex: 1,
  },

  frontFlagPosition: {
    position: "relative",
    right: 0,
    zIndex: 1,
    top: 0,
  },
});
