import React, { useState } from "react";
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "@/providers/Theme";
import { textSizes } from "@/configs/size";

type Props = TextInputProps & {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  border?: boolean;
  focusedBorderColor?: keyof ReturnType<typeof useTheme>["theme"];
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

const AppInput = ({
  size = "md",
  border = true,
  focusedBorderColor = "primary",
  containerStyle,
  inputStyle,
  ...rest
}: Props) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const fontSize = typeof size === "number" ? size : textSizes[size];

  const borderColor = focused ? theme[focusedBorderColor] : "#E0E0E0"; // Default border color when not focused

  return (
    <View
      style={[
        styles.container,
        border && { borderColor, borderWidth: 1 },
        containerStyle,
      ]}
    >
      <TextInput
        {...rest}
        style={[
          {
            fontSize,
            color: theme.text,
            fontFamily: "SpaceMono, System",
            lineHeight: fontSize * 1.4,
            paddingVertical: 8,
            paddingHorizontal: 12,
          },
          inputStyle,
        ]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={theme.subText2}
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
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    justifyContent: "center",
  },
});

export default AppInput;
