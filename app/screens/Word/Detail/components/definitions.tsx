import AppIcon from "@/components/AppIcon";
import { AppPressable } from "@/components/AppPressable";
import AppText from "@/components/AppText";
import { AppMenu } from "@/components/modals/components/MenuModal";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { useState } from "react";
import { View, ViewStyle } from "react-native";
import { WordType } from "../../data";
import WordExample from "./example";

type Props = {
  item: WordType["definitions"][0];
  languageMode: 1 | 2;
  index: number;
  isSimple?: boolean;
  word: string;
  style?: ViewStyle;
};

const WordDefinitions = ({
  item,
  languageMode,
  index,
  isSimple,
  word,
  style,
}: Props) => {
  const examples = item.examples;
  const mainDefinition = item.value[0];
  const subDefinitions = item.value.slice(1);
  const [action, setAction] = useState<null | "edit" | "add">(null);

  const { theme } = useTheme();
  const { setGlobalModal } = useModalStore();
  const { present } = useBottomSheet();
  const showModal = () => {
    // return present({
    //   title: "Example",
    //   render: () => <BottomSheetMenu />,
    // });

    setGlobalModal({
      type: "menu",
      title: "Options",
      menuOptions: [
        {
          icon: (
            <AppIcon name="edit" color="warning" branch="feather" size={22} />
          ),
          rightContent: (
            <AppIcon
              name="chevron-right"
              branch="feather"
              color="subText3"
              size={20}
            />
          ),
          onPress: showEditModal,
          label: "Edit definations",
        },
        {
          icon: (
            <AppIcon name="plus" color="success" branch="feather" size={22} />
          ),
          rightContent: (
            <AppIcon
              name="chevron-right"
              branch="feather"
              color="subText3"
              size={20}
            />
          ),
          label: "Add example",
          onPress: addExampleModal,
        },
        {
          icon: (
            <AppIcon name="trash" color="error" branch="feather" size={22} />
          ),
          rightContent: (
            <AppIcon
              name="chevron-right"
              branch="feather"
              color="subText3"
              size={20}
            />
          ),
          label: "Delete custom defination",
          onPress: addExampleModal,
        },
      ],
    });
  };

  const showEditModal = () => {
    setTimeout(() => {
      setGlobalModal({
        type: "prompt",
        defaultValue: item.value[0],
      });
    }, 500);
  };

  const addExampleModal = () => {
    setTimeout(() => {
      setGlobalModal({
        type: "prompt",
        defaultValue: item.value[0],
      });
    }, 500);
  };

  return (
    <AppPressable onLongPress={showModal} className="py-3" style={style}>
      <AppText color="subText1">
        {mainDefinition[0].toUpperCase()}
        {mainDefinition.slice(1)}
      </AppText>

      {subDefinitions.length > 0 ? (
        <View className="mt-1.5">
          {subDefinitions.map((subDefinition, index2) => {
            return (
              <View key={"sub-" + index2}>
                <AppText
                  key={index2}
                  size={"sm"}
                  font="MulishLight"
                  color="subText1"
                >
                  {subDefinition[0].toUpperCase()}
                  {subDefinition.slice(1)}
                </AppText>
              </View>
            );
          })}
        </View>
      ) : null}

      {!isSimple && examples.length > 0 ? (
        <View className="mt-4 pl-2 gap-4">
          {/* <AppText>Example</AppText> */}
          {examples.map((example, index2) => {
            const translates = example.exampleTranslate;
            const exampleText =
              example.value[0].toUpperCase() + example.value.slice(1);

            return (
              <WordExample
                translates={translates}
                bold={example.bold}
                example={exampleText}
                languageMode={languageMode}
                key={"a" + index2}
              />
            );
          })}
        </View>
      ) : null}
    </AppPressable>
  );
};

const BottomSheetMenu = () => {
  return (
    <View>
      <AppMenu
        label={
          <AppText size={18} font="MulishSemiBold" color="warning">
            Edit definations
          </AppText>
        }
        icon={<AppIcon name="edit" branch="antd" color="warning" size={20} />}
        rightContent={
          <AppIcon branch="feather" color="warning" name={"plus"} size={20} />
        }
      />
      <AppMenu
        label={
          <AppText size={18} font="MulishSemiBold" color="success">
            Add example
          </AppText>
        }
        icon={<AppIcon name="edit" branch="antd" color="success" size={20} />}
        rightContent={
          <AppIcon
            branch="feather"
            color="success"
            name={"chevron-right"}
            size={20}
          />
        }
      />
      <AppMenu
        backgroundColor={"red"}
        label={
          <AppText size={18} font="MulishSemiBold" color="white">
            Delete custom definations
          </AppText>
        }
        icon={<AppIcon name="trash" branch="feather" color="white" size={20} />}
        rightContent={
          <AppIcon
            branch="feather"
            color="white"
            name={"chevron-right"}
            size={20}
          />
        }
      />
    </View>
  );
};
export default WordDefinitions;
