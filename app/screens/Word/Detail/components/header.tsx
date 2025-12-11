import AppButton from "@/components/AppButton";
import CollapseSection from "@/components/AppCollapsable";
import AppIcon from "@/components/AppIcon";
import AppInput from "@/components/AppInput";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { FontAwesome } from "@expo/vector-icons";
import { Dispatch, SetStateAction, useState } from "react";
import {
  Pressable,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

type Props = {
  mode?: "create" | "update" | "view";
  setMode: Dispatch<SetStateAction<"update" | "view">>;
  languageMode: 1 | 2;
  toggleLanguageMode?: () => void;
};
const WordDetailHeader = ({
  mode,
  setMode,
  languageMode,
  toggleLanguageMode,
}: Props) => {
  const { theme } = useTheme();
  const { present } = useBottomSheet();

  const handleAddSense = () =>
    present({
      title: "(n) Tip",
      size: "full",
      render: () => <AddSenseSheet />,
    });
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        // title="Detail"
        rightElement={
          <View className="flex-row gap-2 items-center">
            {mode === "view" ? (
              <View
              // exiting={SlideOutDown}
              >
                <Pressable onPress={toggleLanguageMode}>
                  <Animated.View
                    className="items-center justify-center"
                    layout={LinearTransition}
                    style={[
                      {
                        backgroundColor: theme.background,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        height: 36,
                        width: 36,
                      },
                      languageMode === 2
                        ? styles.frontFlagPosition
                        : styles.backFlagPosition,
                    ]}
                  >
                    <AppText>VI</AppText>
                  </Animated.View>
                  <Animated.View
                    className={"h-8 w-8 items-center justify-center"}
                    layout={LinearTransition}
                    style={[
                      {
                        backgroundColor: theme.background,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        height: 36,
                        width: 36,
                      },
                      languageMode !== 2
                        ? styles.frontFlagPosition
                        : styles.backFlagPosition,
                    ]}
                  >
                    <AppText>EN</AppText>
                  </Animated.View>
                </Pressable>
              </View>
            ) : (
              <View
              // exiting={SlideOutDown}
              >
                <AppButton
                  style={{ minWidth: 0, paddingHorizontal: 10 }}
                  type="error"
                  outline
                  title="Delete"
                  onPress={() => {}}
                  // Delete user word only, user never can delete official word
                >
                  <AppIcon
                    name="trash"
                    branch="feather"
                    size={20}
                    color="error"
                  />
                  {/* <AppText color="white">Delete</AppText> */}
                </AppButton>
              </View>
            )}

            <Animated.View
              className={"h-8 w-8 items-center justify-center"}
              layout={LinearTransition}
              style={[
                {
                  backgroundColor: theme.background,
                  borderWidth: 0.5,
                  // borderColor: theme.secondary,
                  borderRadius: 5,
                  height: 40,
                  width: 40,
                },
              ]}
            >
              <AppIcon
                name="edit"
                branch="antd"
                size={20}
                // color={theme.secondary}
              />
            </Animated.View>

            <View className="flex-row gap-2">
              {/* <AppButton
                onPress={() => {
                  setMode((prev) => (prev === "view" ? "update" : "view"));
                }}
                type={mode === "view" ? "primary" : "success"}
                style={{ minWidth: 0 }}
                outline
              >
                <AppIcon
                  name={mode === "view" ? "copy" : "list"}
                  branch="fa6"
                  size={18}
                  color="primary"
                />
              </AppButton> */}

              <AppButton
                onPress={() => {
                  // router.push(`/screens/Word/Update/${1}`);
                  handleAddSense();
                  // setMode((prev) => (prev === "view" ? "update" : "view"));
                }}
                type={mode === "view" ? "primary" : "success"}
              >
                <AppIcon name={"plus"} branch="antd" size={18} color="white" />
                <AppText color="white">Sense</AppText>
              </AppButton>
            </View>
          </View>
        }
      />
    </View>
  );
};

export default WordDetailHeader;

const styles = StyleSheet.create({
  backFlagPosition: {
    position: "absolute",
    left: -6,
    top: -6,
    // zIndex: 1,
  },

  frontFlagPosition: {
    position: "relative",
    right: 0,
    zIndex: 1,
    top: 0,
  },
});

type SenseType = {
  translations: string[];
  defination: string;
  id: string;
};

const AddSenseSheet = () => {
  const { setGlobalModal, setListModal } = useModalStore();
  const { theme } = useTheme();
  const [translation, setTranslation] = useState("");
  const [senseValue, setSenseValue] = useState<SenseType>({
    translations: [],
    defination: "",
    id: "1234",
  });
  const showExistingDefination = () => {
    setListModal({
      onSubmit: () => {},
      // type: "checkbox"
      outAnimation: "slideOutDown",
      options: [
        { label: "Test", value: "1" },
        { label: "Test", value: "2" },
      ],
      title: "Test",
      value: "1",
    });
  };

  const handleAddTranslations = () => {
    if (translation === "") return;

    if (senseValue.translations.includes(translation)) {
      ToastAndroid.show("Translation already exists", ToastAndroid.SHORT);
      return;
    }
    setSenseValue((prev) => ({
      ...prev,
      translations: [...prev.translations, translation],
    }));
    setTranslation("");
  };

  const removeTranslation = (value: string) => {
    // phân vân translate string hoặc {id:string, value:string}
    //với cách 2 thì lấy các trans có sẵn của word luôn, và thêm từ chưa có. Cách 1 có thể gửi lên kèm wordId, sau đó filter, chưa có thì thêm
    setSenseValue((prev) => ({
      ...prev,
      translations: prev.translations.filter((trans) => trans !== value),
    }));
  };

  return (
    <View className="p-4">
      <View className="flex-row items-center justify-end">
        {/* Header */}
        <View>
          <AppButton onPress={() => {}} type="success">
            <AppIcon branch="antd" name={"check"} color="white" size={20} />
            <AppText color="white" font="MulishMedium">
              Save
            </AppText>
          </AppButton>
        </View>
      </View>
      <View>
        <View className="mt-6 mb-1 flex-row items-center justify-between">
          <AppText color="subText2" size={"sm"}>
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
              numberOfLines={4}
              multiline
              containerStyle={{ backgroundColor: theme.background }}
              style={{ backgroundColor: theme.background }}
              inputStyle={{
                textAlignVertical: "top",
                height: 100,
              }}
              value={senseValue.defination}
              onChangeText={(val) =>
                setSenseValue({ ...senseValue, defination: val })
              }
            />
          </View>
        </View>
      </View>
      <View>
        {/* Translate */}
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
            <AppIcon branch="antd" name={"right"} size={14} color="secondary" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <AppInput
              containerStyle={{ backgroundColor: theme.background }}
              placeholder="Enter your translation"
              value={translation}
              onSubmitEditing={handleAddTranslations}
              onChangeText={(val) => setTranslation(val)}
            />
          </View>
          <AppButton style={{ minWidth: 0 }} onPress={handleAddTranslations}>
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
      {/* Advanced info */}

      <View className="mt-8 bg-gray-100 -mx-3 px-2">
        <CollapseSection title="Create example">
          <View className="px-1">
            <View className="flex-row items-center justify-between">
              <AppText>Hố lê</AppText>
              <AppText>Hố lê</AppText>
              <AppText>Hố lê</AppText>
              <AppText>Hố lê</AppText>
              <AppText>Hố lê</AppText>
              <AppText>Hố lê</AppText>
            </View>
          </View>
        </CollapseSection>
      </View>

      <View className="mt-8 bg-gray-100 -mx-3 px-2">
        <CollapseSection title="Advanced information">
          <View className="px-1">
            <View className="flex-row items-center justify-between">
              <AppText>Hố lê</AppText>
            </View>
          </View>
        </CollapseSection>
      </View>

      <View className="mt-8 bg-gray-100 -mx-3 px-2">
        <CollapseSection title="Related word">
          <View className="px-1">
            <View className="flex-row items-center justify-between">
              <AppText>Hố lê</AppText>
            </View>
          </View>
        </CollapseSection>
      </View>
    </View>
  );
};
