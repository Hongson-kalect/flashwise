import { FontFamily } from "@/configs/fonts";
import { textSizes } from "@/configs/size";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
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
  value: string;
  onChangeText: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
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
  ...rest
}: Props) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const fontSize = typeof size === "number" ? size : textSizes[size];

  const borderColor = focused ? theme[focusedBorderColor] : "#E0E0E0"; // Default border color when not focused

  return (
    <View>
      {label && (
        <AppText
          font="MulishBold"
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
        <View className="items-center justify-center">
          <View
            style={{
              position: "absolute",
              left: 4,
              top: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              opacity: !!rest.value ? 0 : 1,
            }}
          >
            <AppText color="subText3" size={fontSize} font={font}>
              {placeholder}
            </AppText>
          </View>
          <TextInput
            {...rest}
            style={[
              {
                fontSize,
                color: theme.text,
                verticalAlign: "middle",
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
