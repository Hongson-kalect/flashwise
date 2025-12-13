import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { Dispatch, SetStateAction } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SenseType } from "./createSenseSheet";

type Props = {
  languageMode: 1 | 2;
  setLanguageMode: (val: 1 | 2) => void;
  setSenseValue: Dispatch<SetStateAction<SenseType>>;
};
const CreateSenseHeader = ({
  languageMode,
  setLanguageMode,
  setSenseValue,
}: Props) => {
  const { theme } = useTheme();
  const { setGlobalModal } = useModalStore();
  const [targetLang, motherLang] = ["EN", "VI"];

  const toggleLanguageMode = () => {
    setLanguageMode(languageMode === 1 ? 2 : 1);
  };

  const clearSense = () => {
    setGlobalModal({
      type: "confirm",
      message: "Do you want to clear all fields?",
      onOk: () => {
        setSenseValue({
          id: new Date().getTime().toString(),
          defination: "",
          examples: [],
          translations: [],
          traslatedDefination: "",
        });
      },
    });
  };

  return (
    <View className="flex-row items-center justify-between gap-2">
      <View>
        <AppButton onPress={clearSense} type="disabled">
          <AppIcon branch="feather" name={"trash"} color="white" size={20} />
          <AppText color="white" font="MulishMedium">
            Clear
          </AppText>
        </AppButton>
      </View>
      <View className="flex-row items-center justify-end gap-2">
        <View>
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
              <AppText>{motherLang}</AppText>
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
              <AppText>{targetLang}</AppText>
            </Animated.View>
          </Pressable>
        </View>
        {/* Header */}
        <View>
          <AppButton onPress={() => {}} type="success">
            <AppIcon branch="antd" name={"check"} color="white" size={20} />
            <AppText color="white" font="MulishMedium">
              Save
            </AppText>
          </AppButton>
        </View>
      </View>
    </View>
  );
};

export default CreateSenseHeader;

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
