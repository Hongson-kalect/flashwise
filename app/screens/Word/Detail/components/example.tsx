import AppIcon from "@/components/AppIcon";
import { AppPressable } from "@/components/AppPressable";
import AppText from "@/components/AppText";
import { BoldText } from "@/components/output/BoldText";
import { useAppStore } from "@/stores/appStore";
import useModalStore from "@/stores/modalStore";
import { useMemo } from "react";
import { Alert, View } from "react-native";
import { SenseContentType } from "../../data";
import { getLangContent } from "../utils";
import { lightTheme } from "@/configs/theme";

type Props = {
  bold: number[][] | string;
  example: SenseContentType;
};
const WordExample = ({ example, bold }: Props) => {
  const { themeObj, settings, dbService } = useAppStore();
  const theme = useMemo(() => themeObj?.color_palette||lightTheme, [themeObj]);
  const [tExample, nExample] =useMemo(()=>{
      return [getLangContent(example,settings?.learning_language), getLangContent(example,settings?.translate_language)]
    },[example])
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
        defaultValue: tExample?.value,
      });
    }, 500);
  };

  const addExampleModal = () => {
    setTimeout(() => {
      setGlobalModal({
        type: "prompt",
        subMessage: tExample?.value,
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
        defaultValue: nExample?.value,
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
            text={`${tExample?.value?.toUpperCase()||''}${tExample?.value?.slice(1)}||'`}
            bold={bold}
          />
        </AppText>
      </AppPressable>
      {settings?.show_translation && example.translate ? (
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
                {`${nExample?.value?.toUpperCase()||''}${nExample?.value?.slice(1)||''}`}
              </AppText>
            </AppText>
          </AppPressable>
        </View>
      ) : null}
    </View>
  );
};
export default WordExample;
