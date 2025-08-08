import AppSuggestion from "@/components/AppSuggestion";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { TextInput, View } from "react-native";

const WordInput = () => {
  const { theme } = useTheme();
  const [focusing, setFocusing] = useState(false);
  return (
    <View className="flex-row gap-4 items-center">
      {/* <View className="flex-1">
        <AppInput placeholder="Word" />
      </View> */}

      <View
        className="flex-1 h-14 px-2 justify-end relative"
        style={{
          borderBottomWidth: 3,
          borderBottomColor: focusing ? theme.primary : theme.disabled,
        }}
      >
        <View>
          <TextInput
            onFocus={() => setFocusing(true)}
            onBlur={() => setFocusing(false)}
            className="py-2"
            style={{
              fontSize: 24,
              lineHeight: 34,
              fontWeight: 600,
              color: theme.primary,
            }}
            placeholder="Word..."
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

      <View className="w-24 h-14 items-center justify-center">
        <View
          //   style={{ backgroundColor: "red" }}
          className="h-12 w-20 bg-red-500"
        ></View>
      </View>
    </View>
  );
};

export default WordInput;
