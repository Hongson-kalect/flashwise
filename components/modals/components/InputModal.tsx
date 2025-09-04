import AppText from "@/components/AppText";
import { fontFamily } from "@/configs/fonts";
import { BasicModalOptions, InputModalOptions } from "@/providers/Modal";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, TouchableOpacity, View } from "react-native";

type Props = InputModalOptions & BasicModalOptions;

const InputModal = (modal: Props) => {
  const { setGlobalModal } = useModalStore();
  const [value, setValue] = useState("");
  const textRef = useRef<TextInput>(null);
  const textFocus = () => textRef.current?.focus();
  const { theme } = useTheme();

  const submit = () => {
    modal.onOk?.(value);
    setGlobalModal(null);
  };

  useEffect(() => {
    setTimeout(() => textFocus(), 300);
    // textFocus();
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
        className="bg-gray-100 rounded-lg px-1 mt-3"
      >
        {modal.textInnerHeader}
        <TextInput
          style={{ fontFamily: fontFamily.MulishMedium }}
          //   style={{ textAlignVertical: "top", height: 90 }}
          className="text-gray-700 text-xl h-14 px-2"
          ref={textRef}
          onSubmitEditing={submit}
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
            <AppText color="white">{modal.cancelText || "Close"}</AppText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`rounded-lg py-3 items-center justify-center ${
            modal.isShowCancelButton === false
              ? "min-w-36 rounded-full py-4"
              : ""
          } min-w-28`}
          style={{
            backgroundColor: theme.primary,
          }}
          onPress={submit}
        >
          <AppText color="white">{modal.okText || "OK"}</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InputModal;
