import AppButton from "@/components/AppButton";
import CollapseSection, {
  SubCollapseSection,
} from "@/components/AppCollapsable";
import AppIcon from "@/components/AppIcon";
import AppInput from "@/components/AppInput";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { FontAwesome } from "@expo/vector-icons";
import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider } from "react-native-paper";
import Animated, { LinearTransition } from "react-native-reanimated";
import WordExample from "./example";
import TempExampleCreate from "./tempExampleCreate";

type Props = {
  mode?: "create" | "update" | "view";
  setMode: Dispatch<SetStateAction<"update" | "view">>;
  languageMode: 1 | 2;
  toggleLanguageMode: () => void;
};
const WordDetailHeader = ({
  mode,
  setMode,
  languageMode,
  toggleLanguageMode,
}: Props) => {
  const { theme } = useTheme();
  const { present } = useBottomSheet();

  const [senseValue, setSenseValue] = useState<SenseType>({
    id: "1234",
    defination: "",
    traslatedDefination: "",
    translations: [],
    examples: [],
  });

  const handleAddSense = () =>
    present({
      title: "(n) Tip",
      size: "full",
      render: () => (
        <AddSenseSheet
          word="tip"
          handleAddSense={() => {}}
          senseValue={senseValue}
          setSenseValue={setSenseValue}
          languageMode={languageMode}
          toggleLanguageMode={toggleLanguageMode}
        />
      ),
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
  defination: string;
  traslatedDefination: string;
  translations: string[];
  examples: Example[];
  ipa?: string;
  image?: string;
  audios?: {
    url: string;
    label: string;
  };
  id: string;
};

type Example = {
  id: string;
  value: string;
  translate: string;
};
type AddSenseSheetProps = {
  senseValue: SenseType;
  setSenseValue: React.Dispatch<React.SetStateAction<SenseType>>;
  handleAddSense: () => void;
  toggleLanguageMode: () => void;
  languageMode: 1 | 2;
  word: string;
};
const AddSenseSheet = (props: AddSenseSheetProps) => {
  // Model sheet not sync with props, so we need to sync it manually
  const [senseValue, setSenseValue] = useState<SenseType>(props.senseValue);
  const [languageMode, setLanguageMode] = useState<1 | 2>(props.languageMode);
  const [tempExample, setTempExample] = useState<{
    id: string;
    value: string;
    translate: string;
  }>({
    id: new Date().getTime().toString(), // make unique temp id for select purpose
    value: "",
    translate: "",
  });

  const [targetLanguage, motherLanguage] = useMemo(() => {
    return ["EN", "VI"];
  }, []);

  const toggleLanguageMode = () => {
    setLanguageMode((prev) => (prev === 1 ? 2 : 1));
    props.toggleLanguageMode();
  };

  const { setGlobalModal, setListModal } = useModalStore();
  const { theme } = useTheme();
  const [translation, setTranslation] = useState("");

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

  const handleAddExample = () => {
    if (tempExample === null) return;

    setSenseValue((prev) => ({
      ...prev,
      examples: [...prev.examples, { ...tempExample }],
    }));

    setTempExample({
      id: new Date().getTime().toString(),
      value: "",
      translate: "",
    });
  };

  const exampleCache = useRef<Example | null>(null);
  const [exampleMode, setExampleMode] = useState<"add" | "edit">("add");

  const editExample = (example: Example) => {
    // Thực chất thì thằng này sẽ xóa example cũ và thay nó bằng temp
    // Nếu thêm thì vẫn sẽ nhặt lại id cũ
    // Nếu Cancel thì nhặt lại từ temp
    // Mọi dữ liệu trên sheet này đều chỉ là local, chỉ khi save mới thực hiện compare change để gửi lên server. Hoặc đẩy lên server mới compare changed
    setTempExample({
      ...example,
    });
    exampleCache.current = { ...example };
    setExampleMode("edit");

    setSenseValue((prev) => ({
      ...prev,
      examples: prev.examples.filter((ex) => ex.id !== example.id),
    }));

    // setGlobalModal({
    //   type: "confirm",
    //   message: "Do you want to edit this example?",
    //   onOk: () => {
    //     setTempExample({
    //       ...example,
    //     });
    //     exampleCache.current = { ...example };
    //     setExampleMode("edit");

    //     setSenseValue((prev) => ({
    //       ...prev,
    //       examples: prev.examples.filter((ex) => ex.id !== example.id),
    //     }));
    //   },
    // });
  };

  const deleteExample = (id: string) => {
    const Example = senseValue.examples.find((ex) => ex.id === id);
    if (Example) {
      setGlobalModal({
        type: "confirm",
        message: "Do you want to delete this example?",
        onOk: () => {
          setSenseValue((prev) => ({
            ...prev,
            examples: prev.examples.filter((ex) => ex.id !== id),
          }));
        },
      });
    }
  };

  const handleCancelExample = () => {
    if (exampleCache.current) {
      const val = { ...exampleCache.current };
      setSenseValue((prev) => ({
        ...prev,
        examples: [...prev.examples, { ...val }],
      }));
    }

    setTempExample({
      id: new Date().getTime().toString(),
      value: "",
      translate: "",
    });
    exampleCache.current = null;
    setExampleMode("add");
  };

  return (
    <View className="p-4">
      <View className="flex-row items-center justify-end gap-2">
        <View>
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
              <AppText>{motherLanguage}</AppText>
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
              <AppText>{targetLanguage}</AppText>
            </Animated.View>
          </Pressable>
        </View>
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
            {languageMode === 2 ? (
              <AppText color="primary" font="MulishBold" size={"sm"}>
                {targetLanguage + " "}
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

      {languageMode === 2 && (
        <View>
          <View>
            <View className="mt-6 mb-1 flex-row items-center justify-between">
              <AppText color="subText2" size={"sm"}>
                <AppText color="primary" font="MulishBold" size={"sm"}>
                  {motherLanguage}
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
      )}
      {/* Advanced info */}
      <Animated.View layout={LinearTransition} className="mt-8">
        <View className="bg-gray-100 -mx-3 pl-2">
          <CollapseSection title="Example">
            <View className="pl-1">
              {/* Header */}
              {senseValue.examples.map((example, index) => {
                return (
                  <View key={example.id}>
                    <SubCollapseSection
                      title={`Ex${index + 1}: ${example.value}`}
                    >
                      <View className="py-2 pl-2">
                        <WordExample
                          example={example.value}
                          translates={[example.translate]}
                          bold={props.word}
                          languageMode={languageMode}
                        />

                        <View className="flex-row items-center justify-start my-2 gap-2">
                          <AppButton
                            title="Edit"
                            onPress={() => editExample(example)}
                            size="sm"
                            type="warning"
                          >
                            <AppIcon
                              name="edit"
                              branch="feather"
                              size={16}
                              color="white"
                            />
                            <AppText color="white" size={"sm"}>
                              Edit
                            </AppText>
                          </AppButton>

                          <AppButton
                            onPress={() => deleteExample(example.id)}
                            size="sm"
                            type="error"
                          >
                            <AppIcon
                              name="trash"
                              branch="feather"
                              size={16}
                              color="white"
                            />
                            <AppText color="white" size={"sm"}>
                              Remove
                            </AppText>
                          </AppButton>
                        </View>
                      </View>
                    </SubCollapseSection>
                  </View>
                );
              })}
              {/* list existing example with collapseSection */}
              <Divider />
              <TempExampleCreate
                onCancelChange={handleCancelExample}
                exampleMode={exampleMode}
                languageMode={languageMode}
                onAddExample={handleAddExample}
                onMakeExample={() => {
                  setTempExample({
                    id: new Date().getTime().toString(),
                    value: "",
                    translate: "",
                  });
                }}
                example={tempExample}
                setExample={setTempExample}
              />
              {/* add example component if null -> add button */}
            </View>
          </CollapseSection>
        </View>

        <View className="mt-8 bg-gray-100 -mx-3 px-2">
          <CollapseSection title="Advanced information">
            <View className="px-1 py-4">
              <View className="flex-row items-center justify-between">
                <AppText
                  color="subText2"
                  font="MulishRegularItalic"
                  size={"xs"}
                >
                  IPA <AppText color="error">*</AppText>
                </AppText>

                <TouchableOpacity
                  onPress={showExistingDefination}
                  hitSlop={10}
                  className="gap-1 items-center flex-row"
                >
                  <AppText color="secondary" font="MulishBold" size={"xs"}>
                    Preset
                  </AppText>
                  <AppIcon
                    branch="antd"
                    name={"right"}
                    size={12}
                    color="secondary"
                  />
                </TouchableOpacity>
              </View>
              <View className="mt-1">
                <AppInput
                  containerStyle={{ backgroundColor: theme.background }}
                  size={"sm"}
                  value={senseValue?.ipa || ""}
                  onChangeText={(text) =>
                    setSenseValue({ ...senseValue, ipa: text })
                  }
                  placeholder="Type your ipa"
                />
              </View>
            </View>

            <View className="h-4">{/* bottom padding */}</View>
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
      </Animated.View>
    </View>
  );
};

type LineInputProps = {
  label: string;
  isRequired?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  value: string;
  setValue: (value: string) => void;
  isPreset: boolean;
  onPreset: () => void;
};
const LineInput = (props: LineInputProps) => {
  const nextSize: { [k: string]: "sm" | "md" | "lg" | "xl" } = {
    xs: "sm",
    sm: "md",
    md: "lg",
    lg: "xl",
  };
  const { theme } = useTheme();
  return (
    <View>
      <View className="flex-row items-center justify-between">
        <AppText color="subText2" font="MulishRegularItalic" size={props.size}>
          {props.label} {props.isRequired && <AppText color="error">*</AppText>}
        </AppText>

        <TouchableOpacity
          onPress={props.onPreset}
          hitSlop={10}
          className="gap-1 items-center flex-row"
        >
          <AppText color="secondary" font="MulishBold" size={props.size}>
            Preset
          </AppText>
          <AppIcon branch="antd" name={"right"} size={12} color="secondary" />
        </TouchableOpacity>
      </View>
      <View className="mt-1">
        <AppInput
          containerStyle={{ backgroundColor: theme.background }}
          size={props.size ? nextSize[props.size] : "sm"}
          value={props.value}
          onChangeText={(text) => props.setValue(text)}
          placeholder="Type your ipa"
        />
      </View>
    </View>
  );
};
