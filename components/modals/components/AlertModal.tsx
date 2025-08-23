import AppText from "@/components/AppText";
import { AlertModalOptions, BasicModalOptions } from "@/providers/Modal";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { TouchableOpacity, View } from "react-native";

type Props = AlertModalOptions & BasicModalOptions;

const AlertModal = (modal: Props) => {
  const { setGlobalModal } = useModalStore();
  const { theme } = useTheme();
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

      <TouchableOpacity
        style={{ backgroundColor: theme.primary }}
        className="rounded-lg py-3 mt-5 mx-2"
        onPress={() => {
          modal.onOk?.();
          setGlobalModal(null);
        }}
      >
        <AppText
          style={{ fontFamily: "PlaypenSans-Semibold" }}
          className="text-center"
          color="white"
        >
          {modal.okText || "OK"}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

export default AlertModal;
