import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { Dispatch, SetStateAction } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

type Props = {
  languageMode: 1 | 2;
  setLanguageMode: Dispatch<SetStateAction<1 | 2>>;
};
const ToggleWordDisplayMode = ({ languageMode, setLanguageMode }: Props) => {
  const { theme } = useTheme();
  const toggleLanguageMode = () => setLanguageMode(languageMode === 1 ? 2 : 1);

  return (
    <Pressable onPress={toggleLanguageMode}>
      <Animated.View
        className="items-center justify-center"
        layout={LinearTransition}
        style={[
          {
            backgroundColor: theme.secondary,
            borderWidth: 0.5,
            borderColor: theme.secondary,
            borderRadius: 5,
            height: 36,
            width: 36,
          },
          languageMode === 2
            ? styles.frontFlagPosition
            : styles.backFlagPosition,
        ]}
      >
        <AppText color="white">VI</AppText>
      </Animated.View>
      <Animated.View
        className={"h-8 w-8 items-center justify-center"}
        layout={LinearTransition}
        style={[
          {
            backgroundColor: theme.primary,
            borderWidth: 0.5,
            borderColor: theme.primary,
            borderRadius: 5,
            height: 36,
            width: 36,
          },
          languageMode !== 2
            ? styles.frontFlagPosition
            : styles.backFlagPosition,
        ]}
      >
        <AppText color="white">EN</AppText>
      </Animated.View>
    </Pressable>
  );
};

export default ToggleWordDisplayMode;

const styles = StyleSheet.create({
  backFlagPosition: {
    position: "absolute",
    left: -6,
    top: -6,
    opacity: 0.3,
    // zIndex: 1,
  },

  frontFlagPosition: {
    position: "relative",
    right: 0,
    zIndex: 1,
    top: 0,
  },
});
