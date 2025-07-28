import { AppDivider } from "@/components/AppDivider";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import {
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { RadioButton } from "react-native-paper";

type ListModalProps = {
  value: string;
  options: { label: string; value: string | number }[];
  onSubmit: (value: string | number) => void;
  onCancel: () => void;
  title?: string;
  show?: boolean;
};

export const OptionsModal = (props: ListModalProps) => {
  const { height } = useWindowDimensions();
  const { theme } = useTheme();
  const onSubmit = (val: number | string) => {
    props.onSubmit(val);
  };

  const SelectItem = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => {
    const submit = () => onSubmit(value);
    return (
      <TouchableOpacity
        onPress={submit}
        className="flex-row items-center justify-between py-2"
      >
        <AppText style={{ fontFamily: "PlaypenSans-Medium" }}>{label}</AppText>
        <RadioButton
          onPress={submit}
          value={value?.toString()}
          status={value === props.value ? "checked" : "unchecked"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ReactNativeModal
      onBackButtonPress={props.onCancel}
      // animationOut={props.outAnimation}
      // animationIn={props.inAnimation}
      isVisible={props.show}
      backdropTransitionOutTiming={1}
      backdropColor={theme.text}
      backdropOpacity={0.4}
      onBackdropPress={props.onCancel}
      style={{ zIndex: 1000 }}
      avoidKeyboard
    >
      <View
        className="p-4 rounded-xl"
        style={{
          maxHeight: (height / 4) * 3,
          backgroundColor: theme.background,
        }}
      >
        <AppText
          style={{ fontFamily: "PlaypenSans-Semibold" }}
          className="text-2xl text-center mb-4"
        >
          {props.title}
        </AppText>

        <ScrollView>
          {props.options.map((option, index) => (
            <View key={option.value || "null value"}>
              <SelectItem
                key={option.value}
                label={option.label}
                value={option.value}
              />
              {index !== props.options.length - 1 && <AppDivider />}
            </View>
          ))}
        </ScrollView>
      </View>
      {/* </TouchableWithoutFeedback> */}
    </ReactNativeModal>
  );
};
