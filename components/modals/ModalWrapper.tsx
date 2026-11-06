import AppIcon from "@/components/AppIcon";
import { useTheme } from "@/providers/Theme";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import ReactNativeModal from "react-native-modal";
import Animated, { LinearTransition } from "react-native-reanimated";
import AppText from "../AppText";

type Props = {
  show: boolean;
  type?: "input" | "alert" | "confirm" | "prompt" | "custom" | "menu" | "tabs" | "radio" | "checkbox";
  title?: string | React.ReactNode;
  bottom?: React.ReactNode;
  titlePosition?: "center" | "left" | "right";
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
  onCancel: () => void;
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  padding?: number;
  children: React.ReactNode;
};

/** Khung modal giữa màn hình: thẻ bo 24, backdrop mờ, bàn phím đẩy modal lên. */
export default function ModalWrapper(props: Props) {
  const { height } = useWindowDimensions();
  const { theme } = useTheme();

  return (
    <ReactNativeModal
      onBackButtonPress={props.onCancel}
      animationIn={props.inAnimation || "zoomIn"}
      animationOut={props.outAnimation || "zoomOut"}
      animationInTiming={220}
      animationOutTiming={180}
      isVisible={props.show}
      backdropTransitionOutTiming={1}
      backdropOpacity={0.45}
      onBackdropPress={props.onCancel}
      useNativeDriverForBackdrop
      style={{ zIndex: 1000, marginHorizontal: 20 }}
      avoidKeyboard
    >
      <Animated.View layout={LinearTransition.mass(0.6)}>
        <View
          className="overflow-hidden"
          style={{ backgroundColor: theme.background, borderRadius: 24 }}
        >
          <View style={{ maxHeight: (height / 4) * 3 }}>
            {props.title &&
              (typeof props.title === "string" ? (
                <View
                  className="flex-row items-center pl-5 pr-3 pt-4 pb-2"
                >
                  <AppText
                    className="flex-1"
                    font="MulishBold"
                    size="xl"
                    numberOfLines={1}
                    style={{ textAlign: props.titlePosition || "left" }}
                  >
                    {props.title}
                  </AppText>
                  <Pressable
                    hitSlop={10}
                    onPress={props.onCancel}
                    className="h-8 w-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: theme.card }}
                  >
                    <AppIcon
                      branch="feather"
                      name="x"
                      size={18}
                      color={theme.subText2}
                    />
                  </Pressable>
                </View>
              ) : (
                props.title
              ))}
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={{ padding: props.padding ?? 12 }}>
                {props.children}
              </View>
            </ScrollView>
            {props.bottom && <View className="px-4 pb-4">{props.bottom}</View>}
          </View>
        </View>
      </Animated.View>
    </ReactNativeModal>
  );
}
