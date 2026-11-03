import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useDebounce } from "@/hooks/useDebouce";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import Animated from "react-native-reanimated";

type ListModalProps = {
  value: string;
  options: { label: string; value: string | number }[];
  onSubmit: (value: string | number) => void;
  onCancel: () => void;
  type?: "checkbox" | "radio";
  title?: string;
  show?: boolean;
  inAnimation?:
    | "fadeIn"
    | "slideInDown"
    | "slideInUp"
    | "zoomIn"
    | "zoomInDown";
  outAnimation?:
    | "fadeOut"
    | "slideOutDown"
    | "slideOutUp"
    | "zoomOut"
    | "zoomOutDown";
};

export const OptionsModal = (props: ListModalProps) => {
  // Modal sẽ ẩn khi props = null => Dữ liệu bị mất ngay lập tức
  // Animation out sẽ thực hiện với màn trắng => dùng cái này để cache dữ liệu trước đó
  const [placeholder, setPlaceholder] = useState(props);
  const { listModal } = useModalStore();
  const outAnimation = useDebounce(listModal?.outAnimation, 200); // when close all modal will be null, include outAnimation, so keep this to close it correctly

  useEffect(() => {
    props.show && setPlaceholder(props);
  }, [props]);

  const showValue = useMemo(
    () => (props.show ? props : placeholder),
    [placeholder, props],
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
    const active = value === showValue.value;
    return (
      <TouchableOpacity
        onPress={() => onSubmit(value)}
        className="flex-row items-center justify-between px-4 py-3.5 rounded-2xl"
        style={{
          backgroundColor: active ? theme.tertiary + "66" : "transparent",
        }}
      >
        <AppText
          font={active ? "MulishBold" : "MulishMedium"}
          color={active ? "primary" : "text"}
        >
          {label}
        </AppText>
        {active && (
          <AppIcon branch="feather" name="check" size={18} color={theme.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ReactNativeModal
      onBackButtonPress={props.onCancel}
      animationIn={props.inAnimation || "slideInUp"}
      animationOut={outAnimation || "fadeOut"}
      isVisible={props.show}
      backdropTransitionOutTiming={1}
      backdropColor={theme.text}
      backdropOpacity={0.4}
      onBackdropPress={props.onCancel}
      style={{ zIndex: 1000, margin: 0, justifyContent: "center" }}
      avoidKeyboard
    >
      <Animated.View
        className="py-4 mx-5"
        style={{
          maxHeight: (height / 4) * 3,
          backgroundColor: theme.background,
          borderRadius: 24,
        }}
      >
        {showValue.title && (
          <AppText className="mb-3 px-5" font="MulishBold" size={"xl"}>
            {showValue.title}
          </AppText>
        )}

        <ScrollView className="px-2">
          {showValue.options.map((option) => (
            <SelectItem
              key={option.value || "null value"}
              label={option.label}
              value={option.value}
            />
          ))}
        </ScrollView>
      </Animated.View>
      {/* </TouchableWithoutFeedback> */}
    </ReactNativeModal>
  );
};
