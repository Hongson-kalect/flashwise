import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { Dispatch, SetStateAction, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import ToggleWordDisplayMode from "../../Detail/components/toggleWordDisplayMode";

type Props = {
  languageMode: 1 | 2;
  setLanguageMode: Dispatch<SetStateAction<1 | 2>>;
};
const WordDetailHeader = ({ languageMode, setLanguageMode }: Props) => {
  const [submitable, setSubmitable] = useState(false);
  const { theme } = useTheme();

  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        // title="Detail"
        rightElement={
          <View className="flex-row gap-2 items-center">
            <View
            // exiting={SlideOutDown}
            >
              <ToggleWordDisplayMode
                languageMode={languageMode}
                setLanguageMode={setLanguageMode}
              />
            </View>
            <AppButton
              onPress={() => {
                // router.push(`/screens/Word/Update/${1}`);
                // setMode((prev) => (prev === "view" ? "update" : "view"));
              }}
              disabled={!submitable}
              type={submitable ? "primary" : "disabled"}
            >
              <AppIcon name={"plus"} branch="fa6" size={18} color="white" />
              <AppText color="white">{"Create"}</AppText>
            </AppButton>
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
