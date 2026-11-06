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
};
const CreateSenseExample = ({
  senseValue,
  setSenseValue,
}: Props) => {
  const { addModal, closeCurrentModal } = useModalStore();
  const showEditExampleModel = (example: SenseExample) => {
    Keyboard.dismiss();
    addModal({
      type: "custom",
      // defaultValue: "cc",
      render: (
        <EditExampleForm
          example={example}
          onChange={(val) => {
            editExample(val);
            closeCurrentModal();
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

    // addModal({
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
      addModal({
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
    <CollapseSection title="Ví dụ">
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
                      variant="soft"
                    >
                      <AppIcon
                        name="edit-2"
                        branch="feather"
                        size={14}
                        color="warning"
                      />
                      <AppText color="warning" weight="semibold" size={"xs"}>
                        Sửa
                      </AppText>
                    </AppButton>

                    <AppButton
                      onPress={() => removeExample(example.id)}
                      size="sm"
                      type="error"
                      variant="soft"
                    >
                      <AppIcon
                        name="trash-2"
                        branch="feather"
                        size={14}
                        color="error"
                      />
                      <AppText color="error" weight="semibold" size={"xs"}>
                        Xoá
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
            onAddExample={(example: SenseExample) => addExample(example)}
          />
        </Animated.View>
        {/* add example component if null -> add button */}
      </View>
    </CollapseSection>
  );
};

export default CreateSenseExample;
