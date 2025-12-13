import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { ToastAndroid, TouchableOpacity, View } from "react-native";
import { SenseType } from "./createSenseSheet";

type Props = {
  senseValue: SenseType;
  setSenseValue: React.Dispatch<React.SetStateAction<SenseType>>;
  languageMode: 1 | 2;
  setLanguageMode: React.Dispatch<React.SetStateAction<1 | 2>>;
};
const CreateSenseBasicInfo = ({
  languageMode,
  setLanguageMode,
  senseValue,
  setSenseValue,
}: Props) => {
  const [targetLang, motherLang] = ["EN", "VI"];
  const { theme } = useTheme();

  const [translation, setTranslation] = useState("");

  const { setListModal } = useModalStore();
  const showExistingDefination = () => {
    setListModal({
      onSubmit: () => {},
      // type: "checkbox"
      outAnimation: "slideOutDown",
      options: [
        { label: "Test", value: "1" },
        { label: "Test", value: "2" },
      ],
      title: "Definations",
      value: "1",
    });
  };
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
        <View className="mt-6 mb-1 flex-row items-center justify-between">
          <AppText color="subText2" size={"sm"}>
            {languageMode === 2 ? (
              <AppText color="primary" font="MulishBold" size={"sm"}>
                {targetLang + " "}
              </AppText>
            ) : (
              ""
            )}
            Defination
            <AppText color="error"> *</AppText>
          </AppText>

          <TouchableOpacity
            onPress={showExistingDefination}
            hitSlop={10}
            className="gap-1 items-center flex-row"
          >
            <AppText color="secondary" font="MulishBold" size={"sm"}>
              Preset
            </AppText>
            <AppIcon branch="antd" name={"right"} size={14} color="secondary" />
          </TouchableOpacity>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <AppInput
              placeholder="Enter your defination"
              numberOfLines={3}
              multiline
              containerStyle={{ backgroundColor: theme.background }}
              style={{ backgroundColor: theme.background }}
              inputStyle={{
                textAlignVertical: "top",
                height: 75,
              }}
              value={senseValue.defination}
              onChangeText={(val) =>
                setSenseValue({ ...senseValue, defination: val })
              }
            />
          </View>
        </View>
      </View>

      {languageMode === 2 && (
        <View>
          <View>
            <View className="mt-6 mb-1 flex-row items-center justify-between">
              <AppText color="subText2" size={"sm"}>
                <AppText color="primary" font="MulishBold" size={"sm"}>
                  {motherLang}
                </AppText>{" "}
                Defination
                {/* <AppText color="error"> *</AppText> */}
              </AppText>

              <TouchableOpacity
                onPress={showExistingDefination}
                hitSlop={10}
                className="gap-1 items-center flex-row"
              >
                <AppText color="secondary" font="MulishBold" size={"sm"}>
                  Preset
                </AppText>
                <AppIcon
                  branch="antd"
                  name={"right"}
                  size={14}
                  color="secondary"
                />
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <AppInput
                  placeholder="Enter your defination"
                  numberOfLines={3}
                  multiline
                  containerStyle={{ backgroundColor: theme.background }}
                  style={{ backgroundColor: theme.background }}
                  inputStyle={{
                    textAlignVertical: "top",
                    height: 75,
                  }}
                  value={senseValue.traslatedDefination}
                  onChangeText={(val) =>
                    setSenseValue({ ...senseValue, traslatedDefination: val })
                  }
                />
              </View>
            </View>
          </View>

          <View className="mt-8 mb-1 flex-row items-center justify-between">
            <AppText color="subText2" size={"sm"}>
              Translations
            </AppText>

            <TouchableOpacity
              onPress={showExistingDefination}
              hitSlop={10}
              className="gap-1 items-center flex-row"
            >
              <AppText color="secondary" font="MulishBold" size={"sm"}>
                Preset
              </AppText>
              <AppIcon
                branch="antd"
                name={"right"}
                size={14}
                color="secondary"
              />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <AppInput
                containerStyle={{ backgroundColor: theme.background }}
                placeholder="Enter your translation"
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
            <View className="h-10 items-center justify-center">
              <FontAwesome name="hand-o-right" size={18} color="black" />
            </View>
            {senseValue.translations.length ? (
              senseValue.translations.map((item, index) => {
                return (
                  <TouchableOpacity
                    onPress={() => removeTranslation(item)}
                    key={item}
                  >
                    <AppText
                      style={{
                        backgroundColor: theme.warning + "20",
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
                );
              })
            ) : (
              <AppText color="subText3" font="MulishLightItalic" size={"sm"}>
                No translated added
              </AppText>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default CreateSenseBasicInfo;
