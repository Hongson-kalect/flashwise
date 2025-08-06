import AppText from "@/components/AppText";
import { BasicModalOptions, ConfirmModalOptions } from "@/providers/Modal";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { TouchableOpacity, View } from "react-native";

type Props = ConfirmModalOptions & BasicModalOptions;

const ConfirmModal = (modal: Props) => {
  const { setGlobalModal } = useModalStore();
  const { theme } = useTheme();
  return (
    <View>
      {modal.title && (
        <AppText className="text-2xl mb-2" weight="bold" size={"xl"}>
          {modal.title}
        </AppText>
      )}
      <AppText className="mb-4">{modal.message}</AppText>

      {modal?.middle}

      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          className="bg-gray-300 rounded-lg py-3 px-4"
          onPress={() => {
            modal.onCancel?.();
            setGlobalModal(null);
          }}
        >
          <AppText color="white">{modal.cancelText || "Cancel"}</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: theme.primary }}
          className=" rounded-lg py-3 items-center justify-center min-w-28"
          onPress={() => {
            modal.onOk?.();
            setGlobalModal(null);
          }}
        >
          <AppText color="white">{modal.okText || "OK"}</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConfirmModal;
