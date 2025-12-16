import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { View } from "react-native";
import { SenseExample } from "./createSenseSheet";

type Props = {
  languageMode: 1 | 2;
  onAddExample: (example: SenseExample) => void;
};

const TempExampleCreate = ({ languageMode, onAddExample }: Props) => {
  const { theme } = useTheme();
  const [example, setExample] = useState<SenseExample>({
    id: new Date().getTime().toString(),
    value: "",
    translate: "",
  });

  return (
    <View
      style={{
        backgroundColor: theme.background,
        borderWidth: 0.5,
        borderColor: theme.secondary,
      }}
      className="rounded-lg p-4 mb-4 mr-4 mt-4"
    >
      <View>
        <AppText color="subText2" font="MulishRegularItalic" size={"xs"}>
          Example <AppText color="error">*</AppText>
        </AppText>
        <View className="mt-1">
          <AppInput
            size={"sm"}
            value={example.value}
            onChangeText={(text) => setExample({ ...example, value: text })}
            placeholder="Write a natural example sentence"
          />
        </View>
      </View>
      {languageMode === 2 && (
        <View className="mt-3">
          <AppText color="subText2" font="MulishRegularItalic" size={"xs"}>
            Translate
          </AppText>
          <View className="mt-1">
            <AppInput
              size={"sm"}
              value={example.translate}
              onChangeText={(text) =>
                setExample({ ...example, translate: text })
              }
              placeholder="Translate the example sentence"
            />
          </View>
        </View>
      )}
      <View className="flex-row justify-start mt-4">
        <AppButton
          type="success"
          onPress={() => {
            onAddExample(example);
            setExample({
              id: new Date().getTime().toString(),
              value: "",
              translate: "",
            });
          }}
        >
          <AppIcon name="plus" size={14} color="white" branch="antd" />
          <AppText size={"sm"} color="white">
            Add
          </AppText>
        </AppButton>
      </View>
    </View>
  );
};

export default TempExampleCreate;
