import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { LineInput } from "../../Create/components/lineInput";

type Example = {
  value: string;
  translate: string;
};

type Props = {
  onAddExample: (example: Example) => void;
  languageMode: 1 | 2;
};

const CreateExampleForm = (props: Props) => {
  const [example, setExample] = useState({
    value: "",
    translate: "",
  });
  const textRef = useRef<TextInput>(null);
  const textFocus = () => textRef.current?.focus();
  const { theme } = useTheme();

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

      {props.languageMode === 2 && (
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
