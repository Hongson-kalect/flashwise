import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { Dispatch, SetStateAction, useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

const ToggleWordDisplayMode = () => {
  const { themeObj,settings,dbService } = useAppStore();
  const theme = useMemo(() => JSON.parse(themeObj?.color_palette||"{}"), [themeObj]);
  
  const toggleLanguageMode = () => dbService?.setShowTranslation(!settings?.show_translation);

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
          settings?.show_translation
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
          settings?.show_translation
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
    top: -4,
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
