import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useMemo, useState } from "react";
import { View } from "react-native";

const borderStyle = {};

type Props = {
  onAnser: (anser: string) => void;
};

const WordSelect = ({ onAnser }: Props) => {
  const [answers] = useState([
    "Cek",
    "Walk",
    "Punck",
    "Addinationary",
    "KKas dá",
  ]);
  const buttonWidth = useMemo(
    () => (answers.length <= 3 ? "w-full" : "w-1/2"),
    [answers.length]
  );
  return (
    <View className="flex-row flex-wrap gap-y-4 mt-2">
      {answers.map((anser, index) => {
        const padding =
          buttonWidth === "w-1/2" ? (index % 2 === 0 ? "pr-2" : "pl-2") : "";
        return (
          <View key={anser} className={`${buttonWidth} ${padding}`}>
            <AnserButton onPress={() => onAnser(anser)} val={anser} />
          </View>
        );
      })}
    </View>
  );
};

const AnserButton = ({
  val,
  onPress,
}: {
  val: string;
  onPress: () => void;
}) => {
  const { theme } = useTheme();
  return (
    <AppButton
      size="lg"
      style={{
        ...borderStyle,
        borderColor: theme.primary,
        borderTopWidth: 0.5,
        borderRightWidth: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 2,
        shadowColor: theme.primary,
        borderRadius: 8,
        elevation: 2,
      }}
      type="white"
      onPress={onPress}
    >
      <AppText size={16} font="MulishBold" className="text-center">
        {val}
      </AppText>
    </AppButton>
  );
};

export default WordSelect;
