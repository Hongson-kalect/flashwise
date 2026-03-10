import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { Pressable } from "react-native";
import Animated, {
  FadeOut,
  LinearTransition,
  SlideInLeft,
} from "react-native-reanimated";
import AppCheckbox from "../AppCheckbox";

type Props = {
  checked: boolean;
  children: React.ReactNode;
  onSelect: (state: boolean) => void;
  onDismiss: (state: boolean) => void;
  onLongPress: () => void;
  defaultSelected?: boolean;
  disabled?: boolean;
  show?: boolean;
};
const PressSelect = (props: Props) => {
  const { theme } = useTheme();

  const handlePress = (state: boolean) => {
    if (state) {
      return props.onSelect(state);
    }
    props.onDismiss(state);
  };

  const handleLongPress = () => {
    props.onLongPress();
    handlePress(!props.checked);
  };
  return (
    <Pressable
      onPress={props.show ? () => handlePress(!props.checked) : undefined}
      onLongPress={handleLongPress}
      disabled={props.disabled}
      style={{
        borderRadius: 8,
        borderWidth: 1,
        borderColor: props.show && props.checked ? theme.primary : "transparent",
      }}
      className="flex-row items-center"
    >
      {props.show && (
        <Animated.View
          style={{
            paddingHorizontal: 8,
            height: 20,
          }}
          layout={LinearTransition}
          entering={SlideInLeft}
          exiting={FadeOut}
        >
          <AppCheckbox checked={props.checked} />
        </Animated.View>
      )}
      <Animated.View layout={LinearTransition} exiting={FadeOut}>
        {props.children}
      </Animated.View>
    </Pressable>
  );
};

export default PressSelect;
