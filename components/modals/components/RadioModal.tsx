import { AppDivider } from "@/components/AppDivider";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { RadioButton } from "react-native-paper";
import Animated from "react-native-reanimated";

type ListModalProps = {
  value: string;
  options: { label: string; value: string | number }[];
  onSubmit: (value: string | number) => void;
  onCancel: () => void;
  type?: "checkbox" | "radio";
  title?: string;
  show?: boolean;
};

export const OptionsModal = (props: ListModalProps) => {
  // Modal sẽ ẩn khi props = null => Dữ liệu bị mất ngay lập tức
  // Animation out sẽ thực hiện với màn trắng => dùng cái này để cache dữ liệu trước đó
  const [placeholder, setPlaceholder] = useState(props);
  useEffect(() => {
    props.show && setPlaceholder(props);
  }, [props]);

  const showValue = useMemo(
    () => (props.show ? props : placeholder),
    [placeholder, props]
  );

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
          status={value === showValue.value ? "checked" : "unchecked"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ReactNativeModal
      onBackButtonPress={props.onCancel}
      animationIn={"slideInUp"}
      animationOut={"slideOutDown"}
      isVisible={props.show}
      backdropTransitionOutTiming={1}
      backdropColor={theme.text}
      backdropOpacity={0.4}
      onBackdropPress={props.onCancel}
      style={{ zIndex: 1000 }}
      avoidKeyboard
    >
      <Animated.View
        className="p-4 rounded-xl"
        style={{
          maxHeight: (height / 4) * 3,
          backgroundColor: theme.background,
        }}
      >
        {showValue.title && (
          <AppText className="text-2xl mb-4" weight="bold" size={"xl"}>
            {showValue.title}
          </AppText>
        )}

        <ScrollView>
          {showValue.options.map((option, index) => (
            <View key={option.value || "null value"}>
              <SelectItem
                key={option.value}
                label={option.label}
                value={option.value}
              />
              {index !== showValue.options.length - 1 && <AppDivider />}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
      {/* </TouchableWithoutFeedback> */}
    </ReactNativeModal>
  );
};
