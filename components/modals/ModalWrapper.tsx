import { useTheme } from "@/providers/Theme";
import {
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { Card } from "react-native-paper";
import Animated, { LinearTransition } from "react-native-reanimated";
import { AppDivider } from "../AppDivider";
import AppText from "../AppText";

type Props = {
  show: boolean;
  type?: "input" | "alert" | "confirm" | "prompt" | "custom" | "menu" | "tabs";
  title?: string | React.ReactNode;
  bottom?: React.ReactNode;
  titlePosition?: "center" | "left" | "right";
  inAnimation?: "fadeIn" | "slideInDown" | "zoomIn" | "zoomInDown";
  outAnimation?: "fadeOut" | "slideOutDown" | "zoomOut" | "zoomOutDown";
  onCancel: () => void;
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  padding?: number;
  children: React.ReactNode;
};
export default function ModalWrapper(props: Props) {
  const { height } = useWindowDimensions();
  const { theme } = useTheme();

  return (
    // <Modal visible={props.show}>
    <ReactNativeModal
      onBackButtonPress={props.onCancel}
      animationIn={props.inAnimation || "zoomIn"}
      animationOut={props.outAnimation || "slideOutDown"}
      isVisible={props.show}
      backdropTransitionOutTiming={1}
      backdropColor="black"
      backdropOpacity={0.4}
      onBackdropPress={props.onCancel}
      style={{ zIndex: 1000 }}
      avoidKeyboard
    >
      <Animated.View
        layout={
          ["prompt", "input"].includes(props?.type)
            ? LinearTransition.mass(0.6)
            : undefined
        }
      >
        <Card
          style={{ backgroundColor: theme.background }}
          className="relative"
        >
          <View className="pb-5 pt-3" style={{ maxHeight: (height / 4) * 3 }}>
            {props.title &&
              (typeof props.title === "string" ? (
                <View>
                  <AppText
                    style={{
                      textAlign: props.titlePosition || "left",
                      fontFamily: "PlaypenSans-Semibold",
                      color: theme.text,
                    }}
                    className="text-xl p-4"
                  >
                    {props.title || " Title"}
                  </AppText>
                  <AppDivider />
                </View>
              ) : (
                props.title
              ))}
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={{ padding: props.padding || 7 }}>
                {props.children}
              </View>
            </ScrollView>
            {props.bottom && (
              <>
                <AppDivider />
                {props.bottom}
              </>
            )}
          </View>
          {!!props.title && (
            <TouchableOpacity
              onPress={props.onCancel}
              className="absolute top-2 right-2 p-2 rounded-full focus:outline-none focus:ring focus:ring-gray-300"
            >
              <AppText
                style={{ color: theme.subText1 }}
                className=" text-lg font-semibold"
              >
                ×
              </AppText>
            </TouchableOpacity>
          )}
        </Card>
      </Animated.View>
    </ReactNativeModal>
    // </Modal>
  );
}
