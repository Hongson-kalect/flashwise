import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { Dispatch, SetStateAction } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SenseType } from "./createSenseSheet";
import ToggleWordDisplayMode from "./toggleWordDisplayMode";

type Props = {
  languageMode: 1 | 2;
  setLanguageMode: Dispatch<SetStateAction<1 | 2>>;
  setSenseValue: Dispatch<SetStateAction<SenseType>>;
};
const CreateSenseHeader = ({
  languageMode,
  setLanguageMode,
  setSenseValue,
}: Props) => {
  const { theme } = useTheme();
  const { setGlobalModal } = useModalStore();

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
          <ToggleWordDisplayMode
            languageMode={languageMode}
            setLanguageMode={setLanguageMode}
          />
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
