import AppText from "@/components/AppText";
import PressSelect from "@/components/input/PressSelect";
import { useTheme } from "@/providers/Theme";
import { useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import { SearchSuggestion } from "./wordSelectForm";

type Props = {
  word: SearchSuggestion;
  editMode: boolean;
  checked: boolean;
  startEditMode: () => void;
  onSelect: (id: string) => void;
  onDismiss: (id: string) => void;
};
const WordSearchItem = ({ word, ...props }: Props) => {
  const { theme } = useTheme();
  const [status, setStatus] = useState<
    "loading" | "init" | "translating" | "pending" | "done"
  >("loading");

  const bgColor = useMemo(() => {}, [status]);
  // loading = get word status from server
  // init = unpressable. Getting word data from server -> pending.
  // translating = not have translate yet, pressable  -> done
  // pending = have full data, pressable -> done

  useEffect(() => {
    // Nếu là new | ko có id thì socket + init
    if (!word.id) return setStatus("init");

    // Ko có data -> loading -> lấy server data
    if (!word.data) return setStatus("loading");

    //  -> create? init.
    //  ->not have trans? translating,
    //  ->full
    //    -> 1 sense ? tự select hoặc pending
    //    -> Nhiều sense? pending
    // Có data chưa có selected = pending
    // Có data có selected = done
  }, [word]);
  return (
    <Animated.View layout={LinearTransition.springify(1)} exiting={FadeOut}>
      <PressSelect
        checked={props.checked}
        show={props.editMode}
        onLongPress={() => {
          props.startEditMode();
        }}
        onSelect={() => props.onSelect(word.id)}
        onDismiss={() => props.onDismiss(word.id)}
      >
        <TouchableOpacity
          disabled
          className="flex flex-row items-center justify-between gap-6 py-3 pl-2"
        >
          <View className="flex-row items-center gap-4">
            <AppText font="MulishMedium">{word.value}</AppText>
          </View>
          <AppText>{status}</AppText>
        </TouchableOpacity>
      </PressSelect>
    </Animated.View>
  );
};

export default WordSearchItem;
