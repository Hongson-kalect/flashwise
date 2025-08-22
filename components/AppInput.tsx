import { FontFamily } from "@/configs/fonts";
import { textSizes } from "@/configs/size";
import { useTheme } from "@/providers/Theme";
import { useEffect, useState } from "react";
import {
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
  value?: string;
  onValueChange?: (value: string) => void;
};

const AppInput = ({
  label,
  font = "PoppinsRegular",
  size = "md",
  border = true,
  focusedBorderColor = "primary",
  containerStyle,
  inputStyle,
  ...rest
}: Props) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  useEffect(() => {});

  const fontSize = typeof size === "number" ? size : textSizes[size];

  const borderColor = focused ? theme[focusedBorderColor] : "#E0E0E0"; // Default border color when not focused

  return (
    <View>
      {label && (
        <AppText
          font="PoppinsBold"
          size={"sm"}
          color="subText2"
          className="mb-1"
        >
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.container,
          border && { borderColor, borderWidth: 1 },
          containerStyle,
        ]}
      >
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            // alignItems: "center",
            opacity: focused || !!rest.value ? 0 : 1,
          }}
        >
          <AppText color="primary" size={fontSize} font={font}>
            {rest.placeholder}
          </AppText>
        </View>
        <TextInput
          // {...rest}
          style={[
            {
              fontSize,
              color: theme.text,
              fontFamily: "SpaceMono, System",
              lineHeight: fontSize * 1.4,
              paddingVertical: 8,
              paddingHorizontal: 12,
              verticalAlign: "top",
            },
            inputStyle,
          ]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          // placeholderTextColor={theme.subText2}
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
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    justifyContent: "center",
  },
});

export default AppInput;
