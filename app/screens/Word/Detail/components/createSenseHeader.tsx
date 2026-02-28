import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { Dispatch, SetStateAction } from "react";
import { StyleSheet, View } from "react-native";
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
          definition: "",
          examples: [],
          translations: [],
          traslatedDefinition: "",
        });
      },
    });
  };

  return (
    <View className="flex-row items-center justify-between gap-2">
      <View>
        <AppButton onPress={clearSense} size="sm" type="disabled">
          <AppIcon branch="feather" name={"trash"} color="white" size={16} />
          <AppText color="white" font="MulishMedium" size={"sm"}>
            Clear
          </AppText>
        </AppButton>
      </View>
      <View className="flex-row items-center justify-end gap-2">
        <View>
          <View style={{ transform: [{ scale: 0.8 }] }}>
            <ToggleWordDisplayMode
              languageMode={languageMode}
              setLanguageMode={setLanguageMode}
            />
          </View>
        </View>
        {/* Header */}
        <View>
          <AppButton onPress={() => {}} type="success" size="sm">
            <AppIcon branch="antd" name={"check"} color="white" size={16} />
            <AppText color="white" size={"sm"} font="MulishMedium">
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
