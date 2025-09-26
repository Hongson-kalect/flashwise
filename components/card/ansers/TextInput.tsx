import AppIcon from "@/components/AppIcon";
import { fontFamily } from "@/configs/fonts";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  onAnser: (anser: string) => void;
};

const CardTextInput = (props: Props) => {
  const { theme } = useTheme();
  const { setGlobalModal } = useModalStore();
  const [modalInput, setModalInput] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [value, setValue] = useState("");
  const [isFocusing, setIsFocusing] = useState(false);

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
            paddingTop: 4,
            paddingBottom: 16,
            borderColor: theme.primary,
          },
        ]}
      >
        <View className="items-end w-full mb-1">
          <TouchableOpacity
            style={{
              marginRight: 8,
              backgroundColor: theme.primary,
              padding: 10,
              borderRadius: 999,
            }}
            onPress={() =>
              isFocusing ? inputRef.current?.blur() : inputRef.current?.focus()
            }
          >
            <AppIcon
              branch="antd"
              name={isFocusing ? "close" : "edit"}
              size={20}
              color={"white"}
            />
          </TouchableOpacity>
          {/* <AppText size={"sm"} color="subText1" font="MulishLightItalic">
            Nhập lại từ được hiển thị
          </AppText> */}
        </View>
        <View style={{ paddingHorizontal: 8 }}>
          <Pressable
            style={[
              styles.inputWrapper,
              {
                borderColor: theme.primary,
                borderWidth: 1.5,
                borderRadius: 999,
                paddingHorizontal: 16,
                backgroundColor: theme.background,
              },
            ]}
            disabled={!modalInput}
            onPress={handleInput}
          >
            <TextInput
              ref={inputRef}
              autoCorrect={false}
              autoComplete="off"
              autoCapitalize="none"
              submitBehavior="blurAndSubmit"
              onSubmitEditing={() => props.onAnser(value)}
              onFocus={() => setIsFocusing(true)}
              onBlur={() => setIsFocusing(false)}
              enterKeyHint="done"
              readOnly={modalInput}
              value={value}
              onChangeText={setValue}
              style={{
                fontFamily: fontFamily.MulishSemiBold,
                fontSize: 20,
                borderRadius: 0,
              }}
              placeholder="Nhập lại từ này..."
            />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 8,
    // borderWidth: 2,
    backgroundColor: "#fff",
  },
});

export default CardTextInput;
