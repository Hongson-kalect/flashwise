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
};

const PhatAm = ({ audio, disabled, sound }: Props) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => playAudio(audio?.uri || "", sound)}
      disabled={!audio?.uri}
      style={{
        backgroundColor: audio?.uri ? theme.primary : theme.subText3,
      }}
      className=" border-gray-400 rounded-lg h-16 w-16 items-center justify-center mt-2"
    >
      <AppIcon name={"volume-2"} branch="feather" color="white" size={32} />
    </TouchableOpacity>
  );
};

export default PhatAm;
