import { useTheme } from "@/providers/Theme";
import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import { useAppStore } from "@/stores/appStore";
import { useMemo, useState } from "react";
import { ToastAndroid, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SenseType } from "./createSenseSheet";

type Props = {
  senseValue: SenseType;
  setSenseValue: React.Dispatch<React.SetStateAction<SenseType>>;
  /** Mở danh sách gợi ý từ cộng đồng; không có (từ chưa có id) thì ẩn nút Gợi ý. */
  onSuggest?: () => void;
};
const CreateSenseBasicInfo = ({ senseValue, setSenseValue, onSuggest }: Props) => {
  const [targetLang, motherLang] = ["EN", "VI"];
  const { settings, dbService } = useAppStore();
  const { theme } = useTheme();

  const [translation, setTranslation] = useState("");

  const showExistingDefinition = onSuggest;
  const addTranslations = () => {
    if (translation === "") return;
    const trans = translation.trim();
    if (senseValue.translations.includes(trans)) {
      ToastAndroid.show("Translation already exists", ToastAndroid.SHORT);
      return;
    }

    setSenseValue((prev) => ({
      ...prev,
      translations: [...prev.translations, trans],
    }));
    setTranslation("");
  };

  const removeTranslation = (value: string) => {
    setSenseValue((prev) => ({
      ...prev,
      translations: prev.translations.filter((trans) => trans !== value),
    }));
  };

  return (
    <View>
      <View>
        <View className="mb-1.5 flex-row items-center justify-between">
          <AppText color="title" font="MulishBold" size={"sm"}>
            {settings?.show_translation ? (
              <AppText color="title" font="MulishBold" size={"sm"}>
                {targetLang + " "}
              </AppText>
            ) : (
              ""
            )}
            Definition
            <AppText color="error"> *</AppText>
          </AppText>

          <TouchableOpacity
            onPress={showExistingDefinition}
            style={{ display: onSuggest ? "flex" : "none" }}
            hitSlop={10}
            className="gap-1 items-center flex-row"
          >
            <AppText color="primary" font="MulishSemiBold" size={"xs"}>
              Gợi ý
            </AppText>
            <AppIcon branch="feather" name="chevron-right" size={12} color="primary" />
          </TouchableOpacity>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <AppInput
              placeholder="What does this word mean?"
              numberOfLines={3}
              multiline
              containerStyle={{ backgroundColor: theme.background }}
              style={{ backgroundColor: theme.background }}
              inputStyle={{
                textAlignVertical: "top",
                height: 75,
              }}
              value={senseValue.definition}
              onChangeText={(val) =>
                setSenseValue({ ...senseValue, definition: val })
              }
            />
          </View>
        </View>
      </View>

      {settings?.show_translation && (
        <View>
          <View>
            <View className="mt-6 mb-1 flex-row items-center justify-between">
              <AppText color="title" font="MulishBold" size={"sm"}>
                <AppText color="title" font="MulishBold" size={"sm"}>
                  {motherLang}
                </AppText>{" "}
                Definition
                {/* <AppText color="error"> *</AppText> */}
              </AppText>

              <TouchableOpacity
                onPress={showExistingDefinition}
                style={{ display: onSuggest ? "flex" : "none" }}
                hitSlop={10}
                className="gap-1 items-center flex-row"
              >
                <AppText color="primary" font="MulishSemiBold" size={"xs"}>
              Gợi ý
                </AppText>
                <AppIcon branch="feather" name="chevron-right" size={12} color="primary" />
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <AppInput
                  placeholder="Describe this sense in Vietnamese"
                  numberOfLines={3}
                  multiline
                  containerStyle={{ backgroundColor: theme.background }}
                  style={{ backgroundColor: theme.background }}
                  inputStyle={{
                    textAlignVertical: "top",
                    height: 75,
                  }}
                  value={senseValue.traslatedDefinition}
                  onChangeText={(val) =>
                    setSenseValue({ ...senseValue, traslatedDefinition: val })
                  }
                />
              </View>
            </View>
          </View>

          <View className="mt-8 mb-1 flex-row items-center justify-between">
            <AppText color="title" font="MulishBold" size={"sm"}>
              Translations
            </AppText>

            <TouchableOpacity
              onPress={showExistingDefinition}
              style={{ display: onSuggest ? "flex" : "none" }}
              hitSlop={10}
              className="gap-1 items-center flex-row"
            >
              <AppText color="primary" font="MulishSemiBold" size={"xs"}>
              Gợi ý
              </AppText>
              <AppIcon branch="feather" name="chevron-right" size={12} color="primary" />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <AppInput
                containerStyle={{ backgroundColor: theme.background }}
                placeholder={`${"Vietnamese"} translations`}
                value={translation}
                onSubmitEditing={addTranslations}
                onChangeText={(val) => setTranslation(val)}
              />
            </View>
            <AppButton style={{ minWidth: 0 }} onPress={addTranslations}>
              <AppIcon name={"plus"} branch="antd" size={18} color="white" />
            </AppButton>
          </View>

          <View className="flex-row items-center flex-wrap gap-x-3 gap-y-1 mt-2">
            {/* <View className="h-10 items-center justify-center">
              <FontAwesome name="hand-o-right" size={18} color="black" />
            </View> */}
            {senseValue.translations.length
              ? senseValue.translations.map((item, index) => {
                  return (
                    <Animated.View
                      key={item}
                      entering={FadeIn}
                      exiting={FadeOut}
                    >
                      <TouchableOpacity onPress={() => removeTranslation(item)}>
                        <AppText
                          style={{
                            backgroundColor: theme.warning + "15",
                            paddingVertical: 2,
                            paddingHorizontal: 8,
                            borderRadius: 6,
                          }}
                          key={index}
                          color="subText2"
                          font="MulishRegularItalic"
                          size={"sm"}
                        >
                          {item}
                        </AppText>

                        <View
                          style={{
                            position: "absolute",
                            right: -6,
                            top: -2,
                            backgroundColor: theme.error,
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                          }}
                          className="h-2 w-2 rounded-full items-center justify-center"
                        >
                          <AppIcon
                            color="white"
                            name={"x"}
                            branch="feather"
                            size={8}
                          />
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })
              : null}
          </View>
        </View>
      )}
    </View>
  );
};

export default CreateSenseBasicInfo;
