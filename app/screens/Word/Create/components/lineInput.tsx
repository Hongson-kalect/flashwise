import AppIcon from "@/components/AppIcon";
import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { TouchableOpacity, View } from "react-native";

type LineInputProps = {
  label: string;
  isRequired?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  value: string;
  setValue: (value: string) => void;
  onPreset?: () => void;
  lineNumber?: number;
  placeholder?: string;
};
export const LineInput = (props: LineInputProps) => {
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
  const { theme } = useTheme();
  return (
    <View>
      <View className="flex-row items-center justify-between">
        <AppText color="subText2" font="MulishRegularItalic" size={props.size}>
          {props.label} {props.isRequired && <AppText color="error">*</AppText>}
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
            <AppIcon branch="antd" name={"right"} size={12} color="secondary" />
          </TouchableOpacity>
        )}
      </View>
      <View className="mt-1">
        {props.lineNumber ? (
          <AppInput
            multiline
            numberOfLines={props.lineNumber}
            containerStyle={{ backgroundColor: theme.background }}
            inputStyle={{
              textAlignVertical: "top",
              height: props.lineNumber * lineHeight[props?.size || "sm"],
            }}
            size={props.size ? nextSize[props.size] : "sm"}
            value={props.value}
            onChangeText={(text) => props.setValue(text)}
            placeholder={props.placeholder}
          />
        ) : (
          <AppInput
            containerStyle={{ backgroundColor: theme.background }}
            size={props.size ? nextSize[props.size] : "sm"}
            value={props.value}
            onChangeText={(text) => props.setValue(text)}
            placeholder={props.placeholder}
          />
        )}
      </View>
    </View>
  );
};
