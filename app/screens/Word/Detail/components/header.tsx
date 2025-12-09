import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { Dispatch, SetStateAction } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { LinearTransition, SlideInUp } from "react-native-reanimated";

type Props = {
  mode?: "create" | "update" | "view";
  setMode: Dispatch<SetStateAction<"update" | "view">>;
  languageMode: 1 | 2;
  toggleLanguageMode?: () => void;
};
const WordDetailHeader = ({
  mode,
  setMode,
  languageMode,
  toggleLanguageMode,
}: Props) => {
  const { theme } = useTheme();
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        // title="Detail"
        rightElement={
          <View className="flex-row gap-2 items-center">
            {mode === "view" ? (
              <Animated.View
                key={"languageMode"}
                entering={SlideInUp}
                // exiting={SlideOutDown}
              >
                <Pressable onPress={toggleLanguageMode}>
                  <Animated.View
                    layout={LinearTransition}
                    style={[
                      {
                        backgroundColor: theme.background,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        padding: 6,
                      },
                      languageMode === 2
                        ? styles.frontFlagPosition
                        : styles.backFlagPosition,
                    ]}
                  >
                    <AppText className="w-6 h-6">VI</AppText>
                  </Animated.View>
                  <Animated.View
                    layout={LinearTransition}
                    style={[
                      {
                        backgroundColor: theme.background,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        padding: 6,
                      },
                      languageMode !== 2
                        ? styles.frontFlagPosition
                        : styles.backFlagPosition,
                    ]}
                  >
                    <AppText className="w-6 h-6">EN</AppText>
                  </Animated.View>
                </Pressable>
              </Animated.View>
            ) : (
              <Animated.View
                className=""
                key={"deleteButton"}
                entering={SlideInUp}
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
              </Animated.View>
            )}
            <View className="flex-row gap-2">
              <AppButton
                onPress={() => {
                  // router.push(`/screens/Word/Update/${1}`);
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
              </AppButton>

              <AppButton
                onPress={() => {
                  // router.push(`/screens/Word/Update/${1}`);
                  setMode((prev) => (prev === "view" ? "update" : "view"));
                }}
                type={mode === "view" ? "primary" : "success"}
              >
                <AppIcon
                  name={mode === "view" ? "edit" : "check"}
                  branch="fa6"
                  size={18}
                  color="white"
                />
                <AppText color="white">
                  {mode === "view" ? "Edit" : "Done"}
                </AppText>
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
