import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useEffect, useMemo, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { LineInput } from "../../Create/components/lineInput";
import { useAppStore } from "@/stores/appStore";

type Example = {
  value: string;
  translate: string;
};

type Props = {
  onAddExample: (example: Example) => void;
};

const CreateExampleForm = (props: Props) => {
  const [example, setExample] = useState({
    value: "",
    translate: "",
  });
  const textRef = useRef<TextInput>(null);
  const textFocus = () => textRef.current?.focus();
  const { themeObj,settings,dbService } = useAppStore();
  const theme = useMemo(() => JSON.parse(themeObj?.color_palette||"{}"), [themeObj]);

  useEffect(() => {
    setTimeout(() => textFocus(), 300);
  }, []);

  return (
    <View className="pb-8">
      <View className="flex-row items-center justify-between">
        <AppText className="mb-4" size={"xl"} font="MulishBold">
          Add example
        </AppText>

        <View>
          <AppButton
            type="primary"
            onPress={() => props.onAddExample(example)}
            title="Save"
          >
            <AppIcon name="save" branch="fa6" size={18} color="white" />
            <AppText color="white">Save</AppText>
          </AppButton>
        </View>
      </View>
      <LineInput
        ref={textRef}
        key={"edit-example"}
        label="Example"
        isRequired
        size="sm"
        value={example.value}
        setValue={(value) => setExample({ ...example, value })}
      />

      {settings?.show_translation && (
        <View className="mt-3">
          <LineInput
            key={"edit-translate"}
            size="sm"
            label="Translate"
            value={example.translate}
            setValue={(value) => setExample({ ...example, translate: value })}
          />
        </View>
      )}
    </View>
  );
};

export default CreateExampleForm;
