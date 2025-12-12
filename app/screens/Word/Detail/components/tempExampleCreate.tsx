import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";

type Props = {
  exampleMode: "add" | "edit";
  example: {
    id: string;
    value: string;
    translate: string;
  };
  languageMode: 1 | 2;
  setExample: React.Dispatch<
    React.SetStateAction<{
      id: string;
      value: string;
      translate: string;
    }>
  >;
  onAddExample: () => void;
  onMakeExample: () => void;
  onCancelChange: () => void;
};

const TempExampleCreate = ({
  example,
  exampleMode,
  languageMode,
  onAddExample,
  onMakeExample,
  setExample,
  onCancelChange,
}: Props) => {
  const { theme } = useTheme();
  //   if (!example)
  //     return (
  //       <View className="py-4 items-start">
  //         <AppButton
  //           type="primary"
  //           //   outline
  //           //   style={{ backgroundColor: theme.background }}
  //           onPress={onMakeExample}
  //           size="sm"
  //         >
  //           <AppIcon name="plus" size={14} color="white" branch="antd" />
  //           <AppText size={"sm"} color="white">
  //             Make example
  //           </AppText>
  //         </AppButton>
  //       </View>
  //     );

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
            placeholder="Type your example"
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
              placeholder="Type your translate"
            />
          </View>
        </View>
      )}

      {exampleMode === "add" ? (
        <View className="flex-row justify-start mt-4">
          <AppButton type="success" onPress={onAddExample}>
            <AppIcon name="plus" size={14} color="white" branch="antd" />
            <AppText size={"sm"} color="white">
              Add
            </AppText>
          </AppButton>
        </View>
      ) : (
        <View className="flex-row justify-start mt-4 gap-2">
          <AppButton onPress={onAddExample}>
            <AppIcon name="save" size={14} color="white" branch="antd" />
            <AppText size={"sm"} color="white">
              OK
            </AppText>
          </AppButton>
          <AppButton type="error" onPress={onCancelChange}>
            <AppIcon name="reload1" size={14} color="white" branch="antd" />
            <AppText size={"sm"} color="white">
              Cancel
            </AppText>
          </AppButton>
        </View>
      )}
    </View>
  );
};

export default TempExampleCreate;
