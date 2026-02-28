import AppButton from "@/components/AppButton";
import CollapseSection, {
  SubCollapseSection,
} from "@/components/AppCollapsable";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import useModalStore from "@/stores/modalStore";
import { Dispatch, SetStateAction } from "react";
import { Keyboard, View } from "react-native";
import { Divider } from "react-native-paper";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import { SenseExample, SenseType } from "./createSenseSheet";
import EditExampleForm from "./editExampleForm";
import TempExampleCreate from "./tempExampleCreate";

type Props = {
  word: string;
  senseValue: SenseType;
  setSenseValue: Dispatch<SetStateAction<SenseType>>;
  languageMode: 1 | 2;
};
const CreateSenseExample = ({
  word,
  senseValue,
  setSenseValue,
  languageMode,
}: Props) => {
  const { setGlobalModal } = useModalStore();
  const showEditExampleModel = (example: SenseExample) => {
    Keyboard.dismiss();
    setGlobalModal({
      type: "custom",
      // defaultValue: "cc",
      render: (
        <EditExampleForm
          example={example}
          languageMode={2}
          onChange={(val) => {
            editExample(val);
            setGlobalModal(null);
          }}
        />
      ),
    });

    // setTempExample({
    //   ...example,
    // });
    // exampleCache.current = { ...example };
    // setExampleMode("edit");

    // setSenseValue((prev) => ({
    //   ...prev,
    //   examples: prev.examples.filter((ex) => ex.id !== example.id),
    // }));

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

  const addExample = (example: SenseExample) => {
    setSenseValue((prev) => ({
      ...prev,
      examples: [...prev.examples, example],
    }));
  };

  const editExample = (example: SenseExample) => {
    const matched = senseValue.examples.find((ex) => ex.id === example.id);
    if (matched) {
      matched.value = example.value;
      matched.translate = example.translate;
      setSenseValue({ ...senseValue, examples: [...senseValue.examples] }); // reload list
    }
  };

  const removeExample = (id: string) => {
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

  return (
    <CollapseSection title="Example">
      <View className="pl-1">
        {/* Header */}
        {senseValue.examples.map((example, index) => {
          return (
            <Animated.View
              layout={LinearTransition.springify()}
              key={JSON.stringify(example)}
            >
              <SubCollapseSection
                title={
                  <AppText size={"xs"}>
                    <AppText
                      font="MulishBold"
                      size={"xs"}
                    >{`Ex${index + 1}: `}</AppText>
                    {example.value}
                  </AppText>
                }
              >
                <Animated.View exiting={FadeOut} className="py-2 pl-2">
                  {example.translate && (
                    <AppText
                      size={"xs"}
                      color="subText2"
                      font="MulishLightItalic"
                    >
                      {example.translate}
                    </AppText>
                  )}

                  <View className="flex-row items-center justify-start my-2 gap-2">
                    <AppButton
                      title=""
                      onPress={() => showEditExampleModel(example)}
                      size="sm"
                      type="warning"
                    >
                      <AppIcon
                        name="edit"
                        branch="feather"
                        size={16}
                        color="white"
                      />
                      <AppText color="white" size={"xs"}>
                        Edit
                      </AppText>
                    </AppButton>

                    <AppButton
                      onPress={() => removeExample(example.id)}
                      size="sm"
                      type="error"
                    >
                      <AppIcon
                        name="trash"
                        branch="feather"
                        size={16}
                        color="white"
                      />
                      <AppText color="white" size={"xs"}>
                        Remove
                      </AppText>
                    </AppButton>
                  </View>
                </Animated.View>
              </SubCollapseSection>
            </Animated.View>
          );
        })}
        {/* list existing example with collapseSection */}
        <Divider />
        <Animated.View layout={LinearTransition}>
          <TempExampleCreate
            languageMode={languageMode}
            onAddExample={(example: SenseExample) => addExample(example)}
          />
        </Animated.View>
        {/* add example component if null -> add button */}
      </View>
    </CollapseSection>
  );
};

export default CreateSenseExample;
