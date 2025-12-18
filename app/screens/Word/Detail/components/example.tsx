import AppAddIcon from "@/components/AppAddIcon";
import AppIcon from "@/components/AppIcon";
import { AppPressable } from "@/components/AppPressable";
import AppText from "@/components/AppText";
import { BoldText } from "@/components/output/BoldText";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { FontAwesome } from "@expo/vector-icons";
import { Alert, View } from "react-native";

type Props = {
  bold: number[][] | string;
  example: string;
  translates: string[];
  languageMode: 1 | 2;
};
const WordExample = ({ example, languageMode, translates, bold }: Props) => {
  const upperCase = example[0].toUpperCase() + example.slice(1);
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
        defaultValue: example,
      });
    }, 500);
  };

  const addExampleModal = () => {
    setTimeout(() => {
      setGlobalModal({
        type: "prompt",
        subMessage: example,
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
        defaultValue: translates[0],
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

  const translates1 = ["test trans 1"];

  return (
    <View>
      <AppPressable
        hitSlop={5}
        className="py-2 pl-2"
        // onPress={() => Alert.alert("dmm")}
        onLongPress={showExampleOptions}
      >
        <AppText size={"sm"} font="MulishLightItalic" color="primary">
          {/* <AppText size={"sm"} font="MulishRegularItalic" color="primary"> */}
          <AppIcon
            style={{ transform: [{ scaleX: -1 }] }}
            color="primary"
            branch="antd"
            name={"edit"}
            size={12}
          />
          {" : "}
          {/* </AppText> */}
          <BoldText
            size={"sm"}
            color="subText1"
            boldColor="primary"
            font="MulishRegularItalic"
            boldFont="MulishBoldItalic"
            text={upperCase}
            bold={bold}
          />
        </AppText>
      </AppPressable>
      {languageMode === 2 && translates1.length ? (
        <View>
          {translates1.length ? (
            translates1.slice(0, 1).map((translate, index3) => {
              return (
                <AppPressable
                  onLongPress={showExampleTranslateOption}
                  key={index3}
                  hitSlop={{ bottom: 5 }}
                >
                  <AppText
                    key={"b" + index3}
                    className="flex-row items-center gap-2 pt-1 pb-2 pl-2"
                  >
                    <FontAwesome
                      color={theme.primary}
                      name="hand-o-right"
                      className="mr-2"
                      size={12}
                    />
                    {" : "}
                    <AppText
                      key={index3}
                      size={"sm"}
                      font="MulishRegularItalic"
                      color="subText2"
                    >
                      {translate}
                    </AppText>
                  </AppText>
                </AppPressable>
              );
            })
          ) : (
            <View className="flex-row items-center gap-1 justify-between pl-2">
              <View className="flex-row items-center gap-1">
                <FontAwesome
                  name="hand-o-right"
                  size={12}
                  color={theme.subText2}
                />
                <AppText size={"sm"} font="MulishLightItalic" color="subText3">
                  Chưa có bản dịch nào
                </AppText>
              </View>
              <AppAddIcon size="sm" />
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
};
export default WordExample;
