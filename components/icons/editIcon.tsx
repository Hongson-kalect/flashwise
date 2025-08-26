import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";
import AppIcon from "../AppIcon";

const InAnimated = {
  slideInLeft: SlideInLeft,
  slideInRight: SlideInRight,
  default: FadeIn,
};
const OutAnimated = {
  slideOutLeft: SlideOutLeft,
  slideOutRight: SlideOutRight,
  default: FadeOut,
};
type Props = {
  opacity?: number;
  color?: string;
  in?: keyof typeof InAnimated;
  out?: keyof typeof OutAnimated;
};

const EditIcon = (props: Props) => {
  const { theme } = useTheme();
  return (
    <Animated.View
      entering={InAnimated[props.in || "default"]}
      exiting={OutAnimated[props.out || "default"]}
    >
      <View style={{ opacity: props.opacity }}>
        <AppIcon
          name="edit"
          branch="antd"
          size={16}
          color={props.color || theme.secondary}
        />
      </View>
    </Animated.View>
  );
};

export default EditIcon;
