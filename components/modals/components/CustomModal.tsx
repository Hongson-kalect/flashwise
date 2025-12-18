import AppText from "@/components/AppText";
import { BasicModalOptions, CustomModalOptions } from "@/providers/Modal";
import { View } from "react-native";

type Props = CustomModalOptions & BasicModalOptions;

const CustomModal = (modal: Props) => {
  return (
    <View>
      {modal.title && (
        <AppText className="text-2xl" font="MulishBold" size={"xl"}>
          {modal.title}
        </AppText>
      )}
      {modal.message && (
        <AppText className="mt-2" color="subText1">
          {modal.message}
        </AppText>
      )}
      {modal.subMessage && (
        <AppText size={"sm"} className="mt-1.5" color="subText2">
          {modal.subMessage}
        </AppText>
      )}

      <View>{modal?.middle}</View>
      {modal.render}
    </View>
  );
};

export default CustomModal;
