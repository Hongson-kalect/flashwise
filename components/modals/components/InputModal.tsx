import AppText from "@/components/AppText";
import { fontFamily } from "@/configs/fonts";
import { BasicModalOptions, InputModalOptions } from "@/providers/Modal";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import ModalButton from "../ModalButton";

type Props = InputModalOptions & BasicModalOptions;

const InputModal = (modal: Props) => {
  const { setGlobalModal, globalModal } = useModalStore();
  const [value, setValue] = useState("");
  const textRef = useRef<TextInput>(null);
  const textFocus = () => textRef.current?.focus();
  const { theme } = useTheme();

  const submit = () => {
    modal.onOk?.(value);
    setGlobalModal(null);
  };

  useEffect(() => {
    globalModal && setTimeout(() => textFocus(), 300);
  }, []);

  useEffect(() => {
    setValue(modal.defaultValue || "");
  }, [modal.defaultValue]);
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
      {modal?.middle}
      {modal.textOuterHeader}

      <Pressable
        onPress={textFocus}
        className="rounded-2xl px-3 mt-3"
        style={{ backgroundColor: theme.card }}
      >
        {modal.textInnerHeader}
        <TextInput
          style={{ fontFamily: fontFamily.MulishMedium, color: theme.text }}
          placeholderTextColor={theme.subText3}
          //   style={{ textAlignVertical: "top", height: 90 }}
          className="text-xl h-14 px-1"
          ref={textRef}
          onSubmitEditing={submit}
          value={value}
          onChangeText={setValue}
          placeholder={modal.placeholder}
        ></TextInput>
        {modal.textInnerFooter}
      </Pressable>
      {modal.textOuterFooter}

      <View className="flex-row gap-3 mt-5">
        {modal.isShowCancelButton !== false && (
          <ModalButton
            variant="ghost"
            label={modal.cancelText || "Đóng"}
            onPress={() => {
              modal.onCancel?.();
              setGlobalModal(null);
            }}
          />
        )}
        <ModalButton label={modal.okText || "OK"} onPress={submit} />
      </View>
    </View>
  );
};

export default InputModal;
