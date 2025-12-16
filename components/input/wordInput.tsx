import AppSuggestion from "@/components/AppSuggestion";
import { fontFamily } from "@/configs/fonts";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { Keyboard, TextInput, View } from "react-native";

type Props = {
  editable?: boolean;
  value: string;
  onChangeText: (val: string) => void;
};
const WordInput = (props: Props) => {
  const { theme } = useTheme();
  const [focusing, setFocusing] = useState(false);
  const [value, setValue] = useState<string>(props.value);
  return (
    <View className="flex-row gap-4 items-center">
      <View className="flex-1  px-2 justify-end relative">
        <View>
          {/* Create thì sẽ là TextInput, hiển thị bình thường sẽ dùng text, nếu edit thì mở form */}
          <TextInput
            autoFocus={!props.value} // Không có dữ liệu thì sẽ auto focus
            onFocus={() => setFocusing(true)}
            onBlur={() => {
              setFocusing(false);
              props.onChangeText(value);
            }}
            className="py-0"
            readOnly={!props.editable}
            multiline
            enterKeyHint="done"
            scrollEnabled={false}
            style={{
              // fontSize: 32,
              fontSize: 40,
              lineHeight: 40 * 1.4,
              fontFamily: fontFamily.MulishSemiBold,
              color: theme.primary,
              textAlign: "center",
              // width: 200,
              paddingHorizontal: 10,
            }}
            placeholder="Word..."
            value={value}
            onChangeText={setValue}
            placeholderTextColor={theme.disabled}
          />
        </View>

        <AppSuggestion
          show={focusing}
          options={[{ label: "test", value: "test" }]}
          onSelect={(val) => {
            // alert("Bạn vừa chọn " + val);
            Keyboard.dismiss();
            setValue(val);
            props.onChangeText(val);
          }}
        />
      </View>
    </View>
  );
};

export default WordInput;
