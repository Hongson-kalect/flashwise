import CollapseSection from "@/components/AppCollapsable";
import { AppDivider } from "@/components/AppDivider";
import AppText from "@/components/AppText";
import WordInput from "@/components/input/wordInput";
import {
  bottomSheetTitle,
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "@/interfaces/word";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, LayoutChangeEvent, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import WordSelectForm from "../Create/components/wordSelectForm";
import CreateSenseBasicInfo from "../Detail/components/createSenseBasic";
import CreateSenseExample from "../Detail/components/createSenseExample";
import CreateSenseMoreInfo from "../Detail/components/createSenseMoreInfo";
import { SenseType } from "../Detail/components/createSenseSheet";
import WordDetailHeader from "./components/header";
import { LineInput } from "./components/lineInput";

const WordDetail = () => {
  const { theme } = useTheme();
  const { setGlobalModal, setListModal } = useModalStore();
  const { present } = useBottomSheet();
  const { id } = useLocalSearchParams();
  const [labelWidth, setLabelWidth] = useState(0);
  const [pageMode, setPageMode] = useState<"view" | "update" | "create">(
    "create"
  );
  const onLabelLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;

    setLabelWidth((prev) => (width > prev ? width : prev));
  };

  const openInputModal = ({
    title,
    field,
    type = "prompt",
  }: CreateWordInputModalProps) => {
    setGlobalModal({
      type: type,
      title: title,
    });
  };

  const openRadioModal = ({
    title,
    field,
    options,
  }: CreateWordRadioModalProps) => {
    setListModal({
      onSubmit: () => {},
      options,
      title,

      value: "1",
    });
  };

  const openWordSelectForm = ({
    type,
  }: {
    type: keyof typeof bottomSheetTitle;
  }) => {
    present({
      size: "full",
      scrollable: false,
      title: bottomSheetTitle[type],
      render: () => <WordSelectForm />,
    });
  };

  const [languageMode, setLanguageMode] = useState<1 | 2>(2);
  const [senseValue, setSenseValue] = useState<SenseType>({
    definition: "",
    examples: [],
    id: new Date().getTime().toString(),
    translations: [],
    traslatedDefinition: "",
    word: "",
  });

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      style={{ flexGrow: 1, backgroundColor: theme.background }}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={100}
    >
      <View style={{ backgroundColor: theme.background }} className="flex-1">
        <View>
          <WordDetailHeader
            languageMode={languageMode}
            setLanguageMode={setLanguageMode}
          />
        </View>
        <AppDivider />

        <View className="px-2">
          <View className="mt-4">
            <View className=" w-full mr-4 flex-row gap-2 items-center">
              {/* <View className="-scale-x-100">
            <EditIcon />
          </View> */}
              {/* <AppButton type="error" onPress={() => {}}> */}
              <View className="rounded bg-red-400 h-8 w-14"></View>
              {/* </AppButton> */}
            </View>

            {/* <WordTitle>Run</WordTitle> */}
            <View className="py-2 w-full">
              <WordInput
                value={senseValue.word || ""}
                onChangeText={(val) =>
                  setSenseValue({ ...senseValue, word: val })
                }
                editable={true}
              />
            </View>
          </View>

          {senseValue.word && (
            <Animated.View entering={FadeIn} className="mt-2">
              <CreateSenseBasicInfo
                languageMode={languageMode}
                senseValue={senseValue}
                setSenseValue={setSenseValue}
              />

              <Animated.View layout={LinearTransition} className="mt-8">
                <View className="bg-gray-100 -mx-3 pl-2">
                  <CreateSenseExample
                    word={senseValue.word}
                    languageMode={languageMode}
                    senseValue={senseValue}
                    setSenseValue={setSenseValue}
                  />
                </View>

                <View className="mt-8 bg-gray-100 -mx-3 px-2">
                  <CreateSenseMoreInfo
                    senseValue={senseValue}
                    setSenseValue={setSenseValue}
                  />
                </View>

                <View className="mt-8 bg-gray-100 -mx-3 px-2">
                  <CollapseSection title="Related word">
                    <View className="items-end mt-2">
                      <AppText
                        size={"xs"}
                        color="primary"
                        font="MulishLightItalic"
                      >
                        {'Each word separated by ","'}
                      </AppText>
                    </View>
                    <View className="px-1 py-4">
                      <LineInput
                        onPreset={() => Alert.alert("show ipa preset")}
                        label="Related word"
                        value={senseValue.relateds || ""}
                        setValue={(text) =>
                          setSenseValue({ ...senseValue, relateds: text })
                        }
                        size="xs"
                        placeholder="Closely related words or expressions"
                      />
                    </View>
                    <View className="px-1 py-4">
                      <LineInput
                        onPreset={() => Alert.alert("show ipa preset")}
                        label="Synonyms"
                        value={senseValue.synonyms || ""}
                        setValue={(text) =>
                          setSenseValue({ ...senseValue, synonyms: text })
                        }
                        size="xs"
                        placeholder="Words with similar meaning"
                      />
                    </View>
                    <View className="px-1 py-4">
                      <LineInput
                        onPreset={() => Alert.alert("show ipa preset")}
                        label="Antonyms"
                        value={senseValue.antonyms || ""}
                        setValue={(text) =>
                          setSenseValue({ ...senseValue, antonyms: text })
                        }
                        size="xs"
                        placeholder="Words with opposite meaning"
                      />
                    </View>
                    <View className="h-4">{/* bottom padding */}</View>
                  </CollapseSection>
                </View>
              </Animated.View>
            </Animated.View>
          )}

          {/* <View className="mt-6">
            <BasicInformation
              mode={pageMode}
              labelWidth={labelWidth}
              onLabelLayout={onLabelLayout}
              openInputModal={openInputModal}
              openRadioModal={openRadioModal}
            />
          </View> */}

          {/* <View className="mt-6">
            <WordMoreInformation
              mode={pageMode}
              labelWidth={labelWidth}
              onLabelLayout={onLabelLayout}
              openInputModal={openInputModal}
              openRadioModal={openRadioModal}
            />
          </View>

          <AppDivider style={{ marginTop: 16, marginBottom: 12 }} />

          <View>
            <WordAdvanceInformation
              mode={pageMode}
              labelWidth={labelWidth}
              onLabelLayout={onLabelLayout}
              openInputModal={openInputModal}
              openRadioModal={openRadioModal}
              openWordSelectModal={openWordSelectForm}
            />
          </View> */}
        </View>

        {/* <AppDivider style={{ marginTop: 16, marginBottom: 8 }} />

        <View className="mt-8 px-4">
          <AppButton
            title="Xem bản dịch"
            type="primary"
            size="lg"
            onPress={() =>
              router.push("/screens/Word/Create/Translate/List/screen")
            }
          />
        </View> */}

        <View style={{ height: 156 }}></View>

        {/* <AppText>Từ liên quan (search- chọn)</AppText> */}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default WordDetail;
