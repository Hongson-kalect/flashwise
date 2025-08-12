import AppButton from "@/components/AppButton";
import { AppDivider } from "@/components/AppDivider";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { FlatList, ScrollView, Text, TextInput, View } from "react-native";
import WordSearchItem from "./wordSearchItem";

const WordSelectForm = () => {
  const [focusing, setFocusing] = useState(false);
  return (
    <View className="h-full w-full">
      <View className="px-4 justify-center flex-row items-center gap-2">
        {/* <View className="h-8"> */}
        <FlatList
          style={{ paddingVertical: 24, flex: 1, borderRadius: 8 }}
          data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          renderItem={({ item, index }) => <TagItem key={index} />}
          horizontal
          // showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 8 }}
        />
        {/* <ScrollView horizontal className="gap-2 bg-red-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <TagItem key={index} />
            ))}
          </ScrollView> */}
        {/* </View> */}

        <View
          style={{ borderRightWidth: 0.5, borderColor: "gray", height: 32 }}
        ></View>

        <AppButton type="primary" onPress={() => {}}>
          <AppText color="white">Save</AppText>
        </AppButton>
      </View>

      <View className="px-4">
        <View
          style={{ elevation: 5, shadowColor: "black" }}
          className="rounded-full bg-gray-100 py-1 items-center gap-2 px-4 flex-row"
        >
          <AppIcon branch="feather" name="search" />
          <TextInput
            onFocus={() => setFocusing(true)}
            onBlur={() => setFocusing(false)}
            className="flex-1 text-lg"
            placeholder="Tìm kiếm"
          />
        </View>

        {/* <View className="px-4">
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
        </View> */}
      </View>

      {/* <View className="flex-1"> */}
      <View className="flex-1 mt-6">
        <ScrollView className="px-4" keyboardShouldPersistTaps="handled">
          <View>
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

const TagItem = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{ backgroundColor: theme.secondary + "10" }}
      className="px-3 py-1 bg-blue-100 rounded-full h-8 items-center justify-center"
    >
      <Text style={{ color: theme.secondary }} className="text-sm font-medium">
        Test tag
      </Text>

      <View className="absolute -top-1 -right-1">
        <AppIcon
          branch="antd"
          name="closecircle"
          color={theme.secondary + "80"}
          size={14}
        />
      </View>
    </View>
  );
};

export default WordSelectForm;
