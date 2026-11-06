import AppText from "@/components/AppText";
import ModalButton from "../ModalButton";
import { BasicModalOptions, PromptModalOptions } from "@/providers/Modal";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

type Props = PromptModalOptions & BasicModalOptions;

const PromptModal = (modal: Props) => {
  const closeCurrentModal = useModalStore((state) => state.closeCurrentModal);
  const currentModal = useModalStore((state) => state.currentModal);
  const [value, setValue] = useState("");
  const textRef = useRef<TextInput>(null);
  const textFocus = () => textRef.current?.focus();
  const { theme } = useTheme();

  useEffect(() => {
    currentModal && setTimeout(() => textFocus(), 300);
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
        <AppText className="mt-2" color="subText1" numberOfLines={2}>
          {modal.message}
        </AppText>
      )}
      {modal.subMessage && (
        <AppText
          size={"sm"}
          className="mt-1.5"
          color="subText2"
          numberOfLines={3}
        >
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
          style={{ textAlignVertical: "top", height: 90, color: theme.text }}
          ref={textRef}
          multiline
          numberOfLines={4}
          value={value}
          onChangeText={setValue}
          placeholder={modal.placeholder}
          placeholderTextColor={theme.subText3}
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
              closeCurrentModal();
            }}
          />
        )}
        <ModalButton
          label={modal.okText || "OK"}
          onPress={() => {
            modal.onOk?.(value);
            closeCurrentModal();
          }}
        />
      </View>
    </View>
  );
};

export default PromptModal;
