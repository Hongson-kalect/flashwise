import AppSuggestion from "@/components/AppSuggestion";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { TextInput, View } from "react-native";

type Props = {
  editable?: boolean;
  value?: string;
};
const WordInput = (props: Props) => {
  const { theme } = useTheme();
  const [focusing, setFocusing] = useState(false);
  return (
    <View className="flex-row gap-4 items-center">
      <View
        className="flex-1  px-2 justify-end relative"
        style={{
          borderBottomWidth: 2,
          borderBottomColor: props.editable
            ? focusing
              ? theme.primary
              : theme.disabled
            : "transparent",
        }}
      >
        <View>
          <TextInput
            autoFocus // Không có dữ liệu thì sẽ auto focus
            onFocus={() => setFocusing(true)}
            onBlur={() => setFocusing(false)}
            className="py-0"
            readOnly={!props.editable}
            multiline
            scrollEnabled={false}
            style={{
              fontSize: 36,
              lineHeight: 36 * 1.4,
              fontWeight: 500,
              color: theme.primary,
              textAlign: "center",
              // width: 200,
              paddingHorizontal: 10,
            }}
            placeholder="Word..."
            value={props.value}
            placeholderTextColor={theme.disabled}
          />
        </View>

        <AppSuggestion
          show={focusing}
          options={[{ label: "test", value: "test" }]}
          onSelect={(val) => {
            alert("Bạn vừa chọn " + val);
          }}
        />
      </View>

      {/* <View className="w-24 h-14 items-center justify-center">
        <View
          className="h-12 w-20 bg-red-500"
        ></View>
      </View> */}
    </View>
  );
};

export default WordInput;
