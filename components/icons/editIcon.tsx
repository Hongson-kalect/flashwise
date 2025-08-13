import { useTheme } from "@/providers/Theme";
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
      <AppIcon name="edit" branch="antd" size={16} color={theme.secondary} />
    </Animated.View>
  );
};

export default EditIcon;
