import AppText from "@/components/AppText";
import { AlertModalOptions, BasicModalOptions } from "@/providers/Modal";
import useModalStore from "@/stores/modalStore";
import { View } from "react-native";
import ModalButton from "../ModalButton";

type Props = AlertModalOptions & BasicModalOptions;

const AlertModal = (modal: Props) => {
  const closeCurrentModal = useModalStore((state) => state.closeCurrentModal);
  return (
    <View>
      {modal.title && (
        <AppText className="text-2xl mb-2" font="MulishBold" size={"xl"}>
          {modal.title}
        </AppText>
      )}
      <AppText color="subText1">{modal.message}</AppText>
      {modal.subMessage && (
        <AppText className="text-sm mt-1.5" color="subText2">
          {modal.subMessage}
        </AppText>
      )}
      {modal?.middle}

      <View className="mt-6">
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

export default AlertModal;
