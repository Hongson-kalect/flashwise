import AppText from "@/components/AppText";
import { fontFamily } from "@/configs/fonts";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

const CardTextInput = () => {
  const { theme } = useTheme();
  const { setGlobalModal } = useModalStore();
  const [modalInput, setModalInput] = useState(true);
  const [value, setValue] = useState("");

  const handleInput = () => {
    setGlobalModal({
      type: "input",
      message: "Từ của cái của nợ này là?",
      inAnimation: "slideInDown",
      isShowCancelButton: false,
      onOk(value) {
        setValue(value);
      },
    });
  };

  return (
    <>
      <AppText className="mb-2" size={"sm"} font="MulishSemiBold" color="error">
        Từ của cái của nợ thẻ này là?
      </AppText>
      <View>
        <Pressable
          disabled={!modalInput}
          onPress={handleInput}
          style={{
            borderRadius: 8,
            borderWidth: 2,
            borderColor: theme.primary,
            paddingVertical: 4,
            paddingHorizontal: 8,
          }}
        >
          <TextInput
            readOnly={modalInput} // Bật lên nếu dùng modalInput
            value={value}
            onChangeText={setValue}
            style={{
              // color: theme.primary,
              fontFamily: fontFamily.MulishSemiBold,
              fontSize: 20,
            }}
            placeholder="Answer..."
          />
        </Pressable>
      </View>
    </>
  );
};

export default CardTextInput;
