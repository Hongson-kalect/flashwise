import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useState } from "react";
import { View } from "react-native";
import { LineInput } from "../../Create/components/lineInput";

type Example = {
  id: string;
  value: string;
  translate: string;
};

type Props = {
  example: Example;
  onChange: (example: Example) => void;
  languageMode: 1 | 2;
};
const EditExampleForm = (props: Props) => {
  const [example, setExample] = useState(props.example);
  return (
    <View className="pb-8">
      <View className="flex-row items-center justify-between">
        <AppText className="mb-4" size={"xl"} font="MulishBold">
          Edit example
        </AppText>

        <View>
          <AppButton
            type="primary"
            onPress={() => props.onChange(example)}
            title="Save"
          >
            <AppIcon name="save" branch="fa6" size={18} color="white" />
            <AppText color="white">Save</AppText>
          </AppButton>
        </View>
      </View>
      <LineInput
        label="Example"
        isRequired
        size="sm"
        value={example.value}
        setValue={(value) => setExample({ ...example, value })}
      />

      {props.languageMode === 2 && (
        <View className="mt-3">
          <LineInput
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

export default EditExampleForm;
