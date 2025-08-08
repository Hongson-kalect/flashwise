import { AppDivider } from "@/components/AppDivider";
import AppIcon from "@/components/AppIcon";
import AppSuggestion from "@/components/AppSuggestion";
import AppText from "@/components/AppText";
import { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import WordSearchItem from "./wordSearchItem";

const WordSelectForm = () => {
  const [focusing, setFocusing] = useState(false);
  return (
    <View>
      <View className="h-20 items-center flex-row rounded-xl"></View>

      <View>
        <View
          style={{ elevation: 5, shadowColor: "black" }}
          className="rounded-full bg-gray-100 py-1 items-center gap-2 px-3 flex-row"
        >
          <AppIcon branch="feather" name="search" />
          <TextInput
            onFocus={() => setFocusing(true)}
            onBlur={() => setFocusing(false)}
            className="flex-1 text-lg"
            placeholder="Tìm kiếm"
          />
        </View>

        <View className="px-4">
          <AppSuggestion
            show={focusing}
            itemStyle={{ paddingLeft: 44 }}
            options={[
              { label: "Hello", value: "1" },
              { label: "Hello", value: "2" },
              { label: "Hello", value: "3" },
              { label: "Hello", value: "4" },
            ]}
            onSelect={(val) => {
              alert("Bạn vừa chọn " + val);
            }}
          />
        </View>
      </View>

      {/* <View className="flex-1"> */}
      <View className="flex-1">
        <ScrollView>
          <View className="mt-6">
            {Array.from({ length: 20 }).map((_, index) => (
              <View key={index}>
                <WordSearchItem key={index} />
                {index !== 9 && <AppDivider />}
              </View>
            ))}
            <WordSearchItem />
          </View>
        </ScrollView>
      </View>
      {/* </View> */}

      <View>
        <AppText>Nịt</AppText>
      </View>
      <AppText>Thiss is word select form</AppText>
    </View>
  );
};

export default WordSelectForm;
