import { FontFamily } from "@/configs/fonts";
import { textSizes } from "@/configs/size";
import { useTheme } from "@/providers/Theme";
import { useRef, useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import AppText from "./AppText";

type Props = TextInputProps & {
  label?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  border?: boolean;
  font?: FontFamily;
  focusedBorderColor?: keyof ReturnType<typeof useTheme>["theme"];
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  multiline?: boolean;
  numberOfLines?: number;
  value: string;
  onChangeText: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
};

const AppInput = ({
  label,
  font = "MulishRegular",
  size = "md",
  border = true,
  focusedBorderColor = "primary",
  containerStyle,
  inputStyle,
  placeholder,
  required,
  disabled,
  ...rest
}: Props) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const fontSize = typeof size === "number" ? size : textSizes[size];

  const borderColor = focused ? theme[focusedBorderColor] : "#E0E0E0"; // Default border color when not focused

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      {label && (
        <AppText
          font="MulishMedium"
          size={fontSize * 0.9}
          color={focused ? "primary" : "text"}
          className="mb-1"
        >
          {label} {required && <AppText style={{ color: "red" }}>*</AppText>}
        </AppText>
      )}
      <View
        style={[
          styles.container,
          border && { borderColor, borderWidth: 1 },
          containerStyle,
        ]}
      >
        <View className="items-center justify-center">
          <View
            style={{
              position: "absolute",
              left: -6,
              top: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              opacity: !!rest.value ? 0 : 1,
            }}
          >
            <AppText
              style={[inputStyle, { color: theme.subText3, fontFamily: font }]}
              size={fontSize}
              className="scale-90"
            >
              {placeholder}
            </AppText>
          </View>
          <TextInput
            ref={inputRef}
            onFocus={() => {
              rest.onFocus && rest.onFocus();
              setFocused(true);
            }}
            onBlur={() => {
              rest.onBlur && rest.onBlur();
              setFocused(false);
            }}
            {...rest}
            style={[
              {
                fontSize,
                height: fontSize * 1.5,
                width: "100%",
                color: theme.text,
                verticalAlign: "top",
                paddingTop: 1,
                paddingBottom: 0,
                lineHeight: fontSize * 1.4,
              },
              inputStyle,
            ]}
            secureTextEntry={rest.secureTextEntry}
            keyboardType={
              rest.secureTextEntry
                ? "default"
                : rest.keyboardType || rest.autoComplete === "email"
                ? "email-address"
                : "default"
            }
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    justifyContent: "center",
    padding: 8,
  },
});

export default AppInput;
