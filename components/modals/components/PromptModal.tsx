import AppText from "@/components/AppText";
import { BasicModalOptions, PromptModalOptions } from "@/providers/Modal";
import useModalStore from "@/stores/modalStore";
import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, TouchableOpacity, View } from "react-native";

type Props = PromptModalOptions & BasicModalOptions;

const PromptModal = (modal: Props) => {
  const { setGlobalModal } = useModalStore();
  const [value, setValue] = useState("");
  const textRef = useRef<TextInput>(null);
  const textFocus = () => textRef.current?.focus();

  useEffect(() => {
    setTimeout(() => textFocus(), 300);
    // textFocus();
  }, []);

  useEffect(() => {
    setValue(modal.defaultValue || "");
  }, [modal.defaultValue]);
  return (
    <View>
      {modal.promptTitle && (
        <AppText
          style={{ fontFamily: "PlaypenSans-Semibold" }}
          className="text-xl mb-2"
        >
          {modal.promptTitle}
        </AppText>
      )}
      <AppText className="text-gray-700">{modal.message}</AppText>
      {modal.subMessage && (
        <AppText className="text-sm mt-1.5 text-gray-500">
          {modal.subMessage}
        </AppText>
      )}
      {modal?.middle}
      {modal.textOuterHeader}

      <Pressable
        onPress={textFocus}
        className="bg-gray-100 rounded-lg px-1 mt-3"
      >
        {modal.textInnerHeader}
        <TextInput
          style={{ textAlignVertical: "top", height: 90 }}
          className="text-sm text-gray-700 "
          ref={textRef}
          multiline
          numberOfLines={4}
          value={value}
          onChangeText={setValue}
          placeholder={modal.placeholder}
        ></TextInput>
        {modal.textInnerFooter}
      </Pressable>
      {modal.textOuterFooter}

      <View
        style={{
          justifyContent:
            modal.isShowCancelButton !== false ? "space-between" : "center",
        }}
        className="flex-row items-center mt-4"
      >
        {modal.isShowCancelButton !== false && (
          <TouchableOpacity
            className="bg-gray-300 rounded-lg py-3 px-4"
            onPress={() => {
              modal.onCancel?.();
              setGlobalModal(null);
            }}
          >
            <AppText className="text-gray-600">
              {modal.cancelText || "Close"}
            </AppText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`bg-blue-600 rounded-lg py-3 items-center justify-center ${
            modal.isShowCancelButton === false ? "w-full" : ""
          } min-w-28`}
          onPress={() => {
            modal.onOk?.(value);
            setGlobalModal(null);
          }}
        >
          <AppText className="text-white">{modal.okText || "OK"}</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PromptModal;
