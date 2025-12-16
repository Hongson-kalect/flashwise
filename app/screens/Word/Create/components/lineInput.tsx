import AppIcon from "@/components/AppIcon";
import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

type LineInputProps = {
  autoFocus?: boolean;
  label: string;
  isRequired?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  value: string;
  setValue: (value: string) => void;
  onPreset?: () => void;
  lineNumber?: number;
  placeholder?: string;
};

export type LineInputRef = {
  focus: () => void;
  blur: () => void;
  clear: () => void;
};

export const LineInput = forwardRef<LineInputRef, LineInputProps>(
  (props, ref) => {
    const inputRef = useRef<TextInput>(null);
    const { theme } = useTheme();

    const nextSize: { [k: string]: "sm" | "md" | "lg" | "xl" } = {
      xs: "sm",
      sm: "md",
      md: "lg",
      lg: "xl",
    };

    const lineHeight = {
      xs: 18,
      sm: 22,
      md: 25,
      lg: 28,
      xl: 32,
    };

    // 👇 expose method cho component bên ngoài
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => {
        inputRef.current?.clear();
        props.setValue("");
      },
    }));

    useEffect(() => {
      if (props.autoFocus) {
        inputRef.current?.focus();
      }
    }, [props.autoFocus]);

    return (
      <View>
        <View className="flex-row items-center justify-between">
          <AppText
            color="subText2"
            font="MulishRegularItalic"
            size={props.size}
          >
            {props.label}{" "}
            {props.isRequired && <AppText color="error">*</AppText>}
          </AppText>

          {props.onPreset && (
            <TouchableOpacity
              onPress={props.onPreset}
              hitSlop={10}
              className="gap-1 items-center flex-row"
            >
              <AppText color="secondary" font="MulishBold" size={props.size}>
                Preset
              </AppText>
              <AppIcon branch="antd" name="right" size={12} color="secondary" />
            </TouchableOpacity>
          )}
        </View>

        <View className="mt-1">
          <AppInput
            ref={inputRef}
            autoFocus
            multiline={!!props.lineNumber}
            numberOfLines={props.lineNumber}
            containerStyle={{ backgroundColor: theme.background }}
            inputStyle={
              props.lineNumber
                ? {
                    textAlignVertical: "top",
                    height: props.lineNumber * lineHeight[props.size || "sm"],
                  }
                : undefined
            }
            size={props.size ? nextSize[props.size] : "sm"}
            value={props.value}
            onChangeText={props.setValue}
            placeholder={props.placeholder}
          />
        </View>
      </View>
    );
  }
);

LineInput.displayName = "LineInput";
