import { fontFamily } from "@/configs/fonts";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { useEffect, useState } from "react";
import {
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

type Props = {
  onAnser: (anser: string) => void;
};

const CardTextInput = (props: Props) => {
  const { theme } = useTheme();
  const { setGlobalModal } = useModalStore();
  const [modalInput, setModalInput] = useState(false);
  const [value, setValue] = useState("");

  const translateY = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(translateY, {
        toValue: -e.endCoordinates.height, // Di chuyển lên
        duration: 100,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(translateY, {
        toValue: 0, // Trở về vị trí ban đầu
        duration: 100,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleInput = () => {
    setGlobalModal({
      type: "input",
      message: "Từ của cái của nợ này là?",
      inAnimation: "slideInDown",
      isShowCancelButton: false,
      onOk(value) {
        setValue(value);
        props.onAnser(value);
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "red" }}>
      <Animated.View
        style={[
          {
            transform: [{ translateY }],
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 8,
            paddingTop: 4,
            paddingBottom: 16,
            backgroundColor: theme.background,
            borderColor: theme.primary,
          },
        ]}
      >
        <View className="items-end w-full mb-1">
          {/* <AppText size={"sm"} color="subText1" font="MulishLightItalic">
            Nhập lại từ được hiển thị
          </AppText> */}
        </View>
        <Pressable
          style={[styles.inputWrapper, { borderColor: theme.primary }]}
          disabled={!modalInput}
          onPress={handleInput}
        >
          <TextInput
            submitBehavior="blurAndSubmit"
            onSubmitEditing={() => props.onAnser(value)}
            enterKeyHint="done"
            readOnly={modalInput}
            value={value}
            onChangeText={setValue}
            style={{
              fontFamily: fontFamily.MulishSemiBold,
              fontSize: 20,
            }}
            placeholder="Nhập lại từ này..."
          />
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: "#fff",
  },
});

export default CardTextInput;
