import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import TagItem from "@/components/TagItem";
import { useTheme } from "@/providers/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CollectionImage from "../../components/image";
import CollectionWordList from "../../components/wordList";
import DiscoverDetailHeader from "./components/header";

const DiscoverDetail = () => {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const [mode, setMode] = useState<"view" | "update">("view");

  //Cái chi tiết upload collection này có khác so với cái collection bình thường không nhể?
  //Khi tạo thì chỉ đơn giản là upload, không có thêm bớt gì cả. Có sửa thì sửa tên, mô tả, tags,còn về word thì sẽ không thể chủ động thêm sửa
  //Nếu sửa các trường field thì sẽ thay đổi trực tiếp, còn để có thể thay đổi word thì chỉ có thể sync với collection mới được tạo và tạo thành version mới
  //Sau khi tạo thành version mới thì sẽ tạo bản mới trong db. Thêm note bản mới, sync chỉ có thay đổi về chữ hay là nhặt luôn các thông tin text field?
  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View>
        <DiscoverDetailHeader mode={mode} setMode={(mode) => setMode(mode)} />
      </View>

      <KeyboardAwareScrollView style={{ paddingHorizontal: 12 }}>
        <View className="flex-row items-center gap-2">
          <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center">
            <AppIcon name="user" branch="feather" size={12} color="subText3" />
          </View>
          <AppText size={"xs"} color="subText2">
            Hồng Sơn
          </AppText>
        </View>

        <TextInput
          value={"Bảng Cửu Chương"}
          multiline
          readOnly
          // submitBehavior="done"
          returnKeyType="done"
          placeholder="Collection Name"
          onChangeText={(name) => {}}
          style={{
            fontSize: 28,
            fontFamily: "MulishBold",
            color: theme.primary,
            textAlign: "center",
          }}
          placeholderTextColor={"#C4C4C4"}
        />
        <View>
          <CollectionImage source="https://picsum.photos/1200/800" />
        </View>

        <View className="flex-row gap-2 items-center justify-between mt-2">
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            contentContainerStyle={{
              gap: 8,
              alignItems: "center",
            }}
            className=" flex-1"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, index) => (
              <TagItem key={index}>{"item " + item}</TagItem>
            ))}
          </ScrollView>

          <View
            style={{
              backgroundColor: "red",
              borderRightWidth: 0.5,
              borderColor: theme.subText3,
            }}
            className="h-full  border-r border-gray-200"
          ></View>

          <View>
            <AppButton size="xs" type="secondary" outline onPress={() => {}}>
              <AppIcon
                branch="feather"
                name="star"
                size={12}
                color="secondary"
              />
              <AppText size={"xs"} font="MulishBold" color="secondary">
                12k4
              </AppText>
            </AppButton>
          </View>
        </View>

        <View className="mt-8">
          <AppTitle title="Detail" />
          <AppText size={"sm"} color="subText2">
            Lorem ipsum dolor sit amet consectetur adipiscing elit adipiscing
            elit adipiscing elit. sit amet consectetur adipiscing elit
            adipiscing elit adipiscing elit
          </AppText>
        </View>

        {/* <View className="mt-4">
          <CollectionTags />
        </View> */}

        {/* <CollectionCreateOptions /> */}

        {/* Word list */}
        {/* <AppDivider style={{ marginTop: 16 }} /> */}

        <View className="mt-8">
          <AppTitle title="Word Sumary" />

          <View className="rounded-lg mt-3">
            {/* <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <AppText size={"lg"} font="MulishBold" color="subText1">
                  123
                </AppText>
                <AppText size={"lg"} font="MulishBold" color="subText1">
                  words
                </AppText>
              </View>
            </View> */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {[1, 2, 3, 4, 9, 5, 6, 7, 8].map((item, index) => {
                return (
                  <View
                    key={index}
                    className="flex-row items-center gap-2"
                    style={{
                      backgroundColor: theme.primary + "22",
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <View className="h-7 w-7 rounded-full bg-white"></View>
                    <AppText size={"xs"} font="MulishBold" color="subText1">
                      123
                    </AppText>

                    <MaterialCommunityIcons
                      name="cards"
                      size={14}
                      color={theme.subText2}
                    />
                  </View>
                );
              })}
            </ScrollView>
            {/* <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row items-center gap-2">
                <AppText size={"lg"} font="MulishBold" color="subText1">
                  123
                </AppText>
                <AppText size={"lg"} font="MulishBold" color="subText1">
                  Translated
                </AppText>
              </View>
            </View> */}
            <AppText
              size={"xs"}
              className="mt-4"
              font="MulishBold"
              color="subText1"
            >
              Translate
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, padding: 4, marginTop: 8 }}
            >
              {[1, 2, 3, 4, 9, 5, 6, 7, 8].map((item, index) => {
                return (
                  <View
                    key={index}
                    className="flex-row items-center gap-2"
                    style={{
                      backgroundColor: theme.secondary + "22",
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <View className="h-7 w-7 rounded-full bg-white"></View>
                    <AppText size={"xs"} font="MulishBold" color="subText1">
                      123
                    </AppText>

                    <MaterialCommunityIcons
                      name="cards"
                      size={14}
                      color={theme.subText2}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
        <View className="mt-8">
          <CollectionWordList />
        </View>

        <View className="h-10"></View>
      </KeyboardAwareScrollView>

      {/* 
        options: save + options(report | copy id) | remove | edit + options ( delete | sync | un-upload | copy id | update log | update request) | edit complete + delete | unshare + sync + edit,
        copy collection code
        update request if that is protected
        update log

        ower | contributed

        likes,
        name
        image
        tags
        description
        words


      */}
      {/* <AppButton onPress={() => {}} title="Sync" size="xl" /> */}
    </View>
  );
};

export default DiscoverDetail;
