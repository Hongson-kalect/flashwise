import AppIcon from "@/components/AppIcon";
import { AppPressable } from "@/components/AppPressable";
import AppText from "@/components/AppText";
import { BoldText } from "@/components/output/BoldText";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { Alert, View } from "react-native";
import { WordType } from "../../data";

type Props = {
  bold: number[][] | string;
  example: WordType["examples"][0];
  languageMode: 1 | 2;
};
const WordExample = ({ example, languageMode, bold }: Props) => {
  const { theme } = useTheme();

  const { setGlobalModal } = useModalStore();

  const showExampleOptions = () => {
    setGlobalModal({
      type: "menu",
      title: "Example options",
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
          label: "Edit example",
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
          label: "Add translate",
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
          label: "Delete custom example",
          onPress: deleteExampleModal,
        },
      ],
    });
  };
  const showExampleTranslateOption = () => {
    setGlobalModal({
      type: "menu",
      title: "Example translate options",
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
          onPress: showEditTranslateModal,
          label: "Edit translate",
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
          label: "Delete custom translate",
          onPress: deleteTranslateModal,
        },
      ],
    });
  };

  const showEditModal = () => {
    setTimeout(() => {
      setGlobalModal({
        title: "Edit example",
        type: "prompt",
        defaultValue: example.value,
      });
    }, 500);
  };

  const addExampleModal = () => {
    setTimeout(() => {
      setGlobalModal({
        type: "prompt",
        subMessage: example.value,
        title: "Add vietnamese translate",
      });
    }, 500);
  };

  const deleteExampleModal = () => {
    setTimeout(() => {
      setGlobalModal({
        type: "confirm",
        message: "Do you want to delete this example?",
        onOk: () => handleDeleteExample(),
      });
    }, 500);
  };

  const showEditTranslateModal = () => {
    setTimeout(() => {
      setGlobalModal({
        title: "Edit example",
        type: "prompt",
        defaultValue: example.translate,
      });
    }, 500);
  };

  const deleteTranslateModal = () => {
    setTimeout(() => {
      setGlobalModal({
        type: "confirm",
        message: "Do you want to delete this example?",
        onOk: () => handleDeleteExample(),
      });
    }, 500);
  };

  const handleDeleteExample = () => {
    // Chỉ khi definition này được tạo bởi người dùng thì mới có options này, và check lại khi lên server
    // Chỉ xóa ô definition trong userword
    Alert.alert("Deleted");
  };

  return (
    <View
      style={{
        borderLeftWidth: 2,
        borderLeftColor: theme.text + "33",
        backgroundColor: theme.text + "08",
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
      }}
    >
      <AppPressable
        hitSlop={5}
        className="py-2 pl-2"
        onLongPress={showExampleOptions}
      >
        <AppText size={"xs"} font="MulishBold" color="title">
          <BoldText
            size={"sm"}
            color="subText1"
            boldColor="text"
            font="MulishRegular"
            boldFont="MulishBoldItalic"
            text={example.value[0].toUpperCase() + example.value.slice(1)}
            bold={bold}
          />
        </AppText>
      </AppPressable>
      {languageMode === 2 && example.translate ? (
        <View>
          <AppPressable
            onLongPress={showExampleTranslateOption}
            hitSlop={{ bottom: 5 }}
          >
            <AppText
              font="MulishLightItalic"
              color="primary"
              className="flex-row items-center gap-2 pt-1 pb-2 pl-2"
            >
              <AppText size={"xs"} font="MulishLightItalic" color="subText2">
                {example.translate[0].toUpperCase() +
                  example.translate.slice(1)}
              </AppText>
            </AppText>
          </AppPressable>
        </View>
      ) : null}
    </View>
  );
};
export default WordExample;
