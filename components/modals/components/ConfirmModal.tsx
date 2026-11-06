import AppText from "@/components/AppText";
import { BasicModalOptions, ConfirmModalOptions } from "@/providers/Modal";
import useModalStore from "@/stores/modalStore";
import { View } from "react-native";
import ModalButton from "../ModalButton";

type Props = ConfirmModalOptions & BasicModalOptions;

const ConfirmModal = (modal: Props) => {
  const closeCurrentModal = useModalStore((state) => state.closeCurrentModal);
  return (
    <View>
      {modal.title && (
        <AppText className="text-2xl mb-2" font="MulishBold" size={"xl"}>
          {modal.title}
        </AppText>
      )}
      <AppText className="mb-4">{modal.message}</AppText>

      {modal?.middle}

      <View className="flex-row gap-3 mt-4">
        <ModalButton
          variant="ghost"
          label={modal.cancelText || "Huỷ"}
          onPress={() => {
            modal.onCancel?.();
            closeCurrentModal();
          }}
        />
        <ModalButton
          label={modal.okText || "OK"}
          onPress={() => {
            modal.onOk?.();
            closeCurrentModal();
          }}
        />
      </View>
    </View>
  );
};

export default ConfirmModal;
