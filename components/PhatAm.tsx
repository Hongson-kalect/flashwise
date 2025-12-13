import { useTheme } from "@/providers/Theme";
import { AudioType } from "@/stores/recordingStore";
import { playAudio } from "@/utils/audioPlay";
import { Audio } from "expo-av";
import { DocumentPickerAsset } from "expo-document-picker";
import { Dispatch, SetStateAction } from "react";
import { TouchableOpacity } from "react-native";
import AppIcon from "./AppIcon";

type Props = {
  audio: DocumentPickerAsset | AudioType | null;
  sound: [Audio.Sound | null, Dispatch<SetStateAction<Audio.Sound | null>>];
  disabled: boolean;
  size?: "tiny" | "small" | "medium" | "large";
};

export const scaleSize = {
  tiny: {
    width: 36,
    icon: 20,
  },
  small: {
    width: 40,
    icon: 24,
  },
  medium: {
    width: 56,
    icon: 32,
  },
  large: {
    width: 80,
    icon: 40,
  },
};

const PhatAm = ({ audio, disabled, sound, size = "medium" }: Props) => {
  const { theme } = useTheme();
  const { width, icon } = scaleSize[size];

  return (
    <TouchableOpacity
      onPress={() => playAudio(audio?.uri || "", sound)}
      disabled={!audio?.uri}
      style={{
        backgroundColor: audio?.uri ? theme.primary : theme.subText3,
        width: width,
        height: width,
      }}
      className=" border-gray-400 rounded-lg h-16 w-16 items-center justify-center"
    >
      <AppIcon name={"volume-2"} branch="feather" color="white" size={icon} />
    </TouchableOpacity>
  );
};

export default PhatAm;
