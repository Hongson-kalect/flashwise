import { fontFamily } from "@/configs/fonts";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { useRef, useState } from "react";
import { View } from "react-native";
import { Divider } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import AppIcon from "../AppIcon";
import AppInput from "../AppInput";
import AppText from "../AppText";

const AppSearch = () => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef(null);
  const { present } = useBottomSheet();
  const { setGlobalModal, setListModal } = useModalStore();
  const showFilterModal = () => {
    setGlobalModal({
      type: "menu",
      // render: <FilterModal />,
      title: "Filter",
      menuOptions: [
        {
          label: "Ngôn ngữ",
          rightContent: (
            <AppText size={"sm"} color="subText2">
              English
            </AppText>
          ),
          isCloseAfterPress: false,
          onPress: showLanguageModal,
        },
        {
          label: "Từ loại",
          rightContent: (
            <AppText size={"sm"} color="subText2">
              All
            </AppText>
          ),
          isCloseAfterPress: false,
          onPress: showWordTypeModal,
        },
        // {
        //   label: "Tags",
        //   rightContent: (
        //     <AppText
        //       size={"sm"}
        //       color="subText2"
        //       numberOfLines={1}
        //       style={{ flex: 1 }}
        //     >
        //       All All All All All All All All All All All All All All All All
        //       All All All All All All All All All All All All All All All All
        //       All All All All All All All All All
        //     </AppText>
        //   ),
        //   isCloseAfterPress: false,
        // },
      ],
    });
  };

  const showLanguageModal = () => {
    setListModal({
      title: "Language",
      options: [
        { label: "All", value: "all" },
        { label: "English", value: "en" },
        { label: "Vietnamese", value: "vi" },
      ],
      onSubmit: () => {
        // Cài vào biển
      },
      value: "en",
    });
  };
  const showWordTypeModal = () => {
    setListModal({
      title: "Word Type",
      options: [
        { label: "All", value: "all" }, // danh từ
        { label: "Noun", value: "noun" }, // danh từ
        { label: "Verb", value: "verb" }, // động từ (bao gồm cả động từ thường, modal, auxiliary, copula)
        { label: "Adjective", value: "adj" }, // tính từ
        { label: "Adverb", value: "adv" }, // trạng từ
        { label: "Pronoun", value: "pron" }, // đại từ
        { label: "Preposition", value: "prep" }, // giới từ
        { label: "Conjunction", value: "conj" }, // liên từ
        { label: "Determiner", value: "det" }, // từ hạn định (bao gồm article: a, the, this, those...)
        { label: "Numeral", value: "num" }, // số từ (one, two, first, second...)
        { label: "Particle", value: "particle" }, // trợ từ, tiểu từ (rất quan trọng cho tiếng Nhật, Việt, Hàn)
        { label: "Expression", value: "expr" }, // cụm cố định: idioms, phrasal verbs, proverbs...
        { label: "Other", value: "other" }, // loại không xác định, không phổ biến
      ],
      onSubmit: () => {},
      value: "en",
    });
  };

  return (
    <View
      style={{ borderRadius: 999, elevation: 4 }}
      className={"flex-row items-center px-5 bg-gray-100 h-14"}
    >
      <View className="flex-row items-center flex-1">
        <AppIcon name="search1" branch="antd" size={24} color="#888" />
        <View className="flex-1 justify-center">
          <AppInput
            style={{
              fontFamily: fontFamily.MulishBold,
              alignItems: "center",
              flex: 1,
              fontSize: 16,
              justifyContent: "center",
              borderColor: "transparent",
            }}
            inputStyle={{
              fontFamily: fontFamily.MulishMedium,
            }}
            containerStyle={{ borderColor: "transparent" }}
            value={value}
            onChangeText={(value) => setValue(value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search......"
            // className="h-full w-full text-lg"
          />
        </View>
      </View>
      <View className="flex-row gap-1 items-center">
        <View className="h-full items-center justify-center pr-2">
          {focused && value && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              className={"h-full items-center justify-center"}
            >
              <AppIcon
                name="closecircle"
                branch="antd"
                size={16}
                color="#888"
              />
            </Animated.View>
          )}
          {/* <AppIcon name="closecircle" branch="antd" size={16} color="#555" /> */}
        </View>
        <AppIcon
          onPress={showFilterModal}
          name={"filter"}
          branch="antd"
          size={24}
          color="#888"
        />
      </View>
    </View>
  );
};

const FilterModal = () => {
  return (
    <View>
      <View className="flex-row gap-2 items-center">
        <AppIcon name="filter" branch="antd" size={24} color="#888" />
        <AppText size={18}>Filter</AppText>
      </View>
      {/* <Divider style={{ width: "100%" }} /> */}

      <View className="mt-2">
        <ModalItem />
        <Divider />
        <ModalItem />
        <Divider />
        <ModalItem />
      </View>
      {/* Có những loại filter nào nhỉ?
        // Tags
        // Loại từ
        // Ngôn ngữ
      */}
    </View>
  );
};

const ModalItem = () => {
  return (
    <View className="flex-row items-center gap-2 justify-between h-14">
      <AppText font="MulishMedium" size={"lg"}>
        ModalItem
      </AppText>
      <AppText size={"sm"} color="subText2">
        Value
      </AppText>
    </View>
  );
};

export default AppSearch;
