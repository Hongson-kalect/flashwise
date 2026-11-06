import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { Dispatch, SetStateAction, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { SenseType } from "./createSenseSheet";
import ToggleWordDisplayMode from "./toggleWordDisplayMode";

type Props = {
  setSenseValue: Dispatch<SetStateAction<SenseType>>;
};
const CreateSenseHeader = ({
  setSenseValue,
}: Props) => {
  const addModal = useModalStore((state) => state.addModal);

  const clearSense = () => {
    addModal({
      type: "confirm",
      title: "Xoá toàn bộ nội dung?",
      message: "Các trường đã nhập sẽ bị xoá.",
      okText: "Xoá hết",
      cancelText: "Giữ lại",
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
      <AppButton onPress={clearSense} size="sm" variant="soft" type="error">
        <AppIcon branch="feather" name="rotate-ccw" size={15} color="error" />
        <AppText color="error" weight="semibold" size="sm">
          Xoá hết
        </AppText>
      </AppButton>
      <View className="flex-row items-center gap-3">
        <View style={{ transform: [{ scale: 0.85 }] }}>
          <ToggleWordDisplayMode />
        </View>
        <AppButton onPress={() => {}} size="sm">
          <AppIcon branch="feather" name="check" size={16} color="white" />
          <AppText color="white" size="sm" weight="bold">
            Lưu
          </AppText>
        </AppButton>
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
