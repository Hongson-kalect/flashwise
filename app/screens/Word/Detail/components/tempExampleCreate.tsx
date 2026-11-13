import { useTheme } from "@/providers/Theme";
import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import { useAppStore } from "@/stores/appStore";
import { useState } from "react";
import { View } from "react-native";
import { SenseExample } from "./createSenseSheet";

type Props = {
  onAddExample: (example: SenseExample) => void;
};

const TempExampleCreate = ({ onAddExample }: Props) => {
  const { settings } = useAppStore();
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
        <AppText color="title" font="MulishBold" size={"xs"}>
          Example{" "}
          <AppText size={"xs"} color="error">
            *
          </AppText>
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
      {settings?.show_translation && (
        <View className="mt-3">
          <AppText color="title" font="MulishBold" size={"xs"}>
            Translate
          </AppText>
          <View className="mt-1">
            <AppInput
              size={"sm"}
              value={example.translate || ""}
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
          size="sm"
          onPress={() => {
            onAddExample(example);
            setExample({
              id: new Date().getTime().toString(),
              value: "",
              translate: "",
            });
          }}
        >
          <AppIcon name="plus" size={14} color="white" branch="feather" />
          <AppText size={"sm"} weight="bold" color="white">
            Thêm ví dụ
          </AppText>
        </AppButton>
      </View>
    </View>
  );
};

export default TempExampleCreate;
