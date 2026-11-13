
import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useAppStore } from "@/stores/appStore";
import useModalStore from "@/stores/modalStore";
import { useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { LineInput } from "../../Create/components/lineInput";
import { SenseExample } from "./createSenseSheet";

type Props = {
  example: SenseExample;
  onChange: (example: SenseExample) => void;
};
const EditExampleForm = (props: Props) => {
  const [example, setExample] = useState(props.example);
  const currentModal = useModalStore((state) => state.currentModal);
  const textRef = useRef<TextInput>(null);
  const textFocus = () => textRef.current?.focus();
  const { settings } = useAppStore();
  

  

  useEffect(() => {
    currentModal && setTimeout(() => textFocus(), 300);
    // textFocus();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý: chỉ chạy lại khi phụ thuộc liệt kê đổi (hàm / đối tượng còn lại đổi mỗi lần render hoặc đã ổn định)
  }, []);

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
            value={example?.translate || ""}
            setValue={(value) => setExample({ ...example, translate: value })}
          />
        </View>
      )}
    </View>
  );
};

export default EditExampleForm;
