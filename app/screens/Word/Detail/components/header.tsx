import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { Dispatch, SetStateAction, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import CreateSenseSheet, { SenseType } from "./createSenseSheet";
import ToggleWordDisplayMode from "./toggleWordDisplayMode";

type Props = {
  mode?: "create" | "update" | "view";
  setMode: Dispatch<SetStateAction<"update" | "view">>;
  languageMode: 1 | 2;
  setLanguageMode: Dispatch<SetStateAction<1 | 2>>;
};
const WordDetailHeader = ({
  mode,
  setMode,
  languageMode,
  setLanguageMode,
}: Props) => {
  const { theme } = useTheme();
  const { present } = useBottomSheet();
  const { setGlobalModal } = useModalStore();

  // just use temp. buttom sheet will change this value while editing
  const [tempSenseValue, setTempSenseValue] = useState<SenseType>({
    id: new Date().getTime().toString(),
    definition: "",
    traslatedDefinition: "",
    translations: [],
    examples: [],
  });

  const handleAddSense = () =>
    present({
      title: "Add sense - (n) Tip",
      size: "full",
      render: () => (
        <CreateSenseSheet
          word="tip"
          handleAddSense={() => {}}
          senseValue={tempSenseValue}
          setSenseValue={setTempSenseValue}
          languageMode={languageMode}
          setLanguageMode={setLanguageMode}
        />
      ),
    });

  const handleEditSense = () =>
    present({
      title: "Add sense - (n) Tip",
      size: "full",
      render: () => (
        <CreateSenseSheet
          word="tip"
          handleAddSense={() => {}}
          // Lấy full sense data , lên sheet thì clone lại
          senseValue={tempSenseValue}
          setSenseValue={setTempSenseValue}
          languageMode={languageMode}
          setLanguageMode={setLanguageMode}
        />
      ),
    });

  const showMoreMenu = () => {
    setGlobalModal({
      type: "menu",
      menuOptions: [
        {
          label: "Edit sense - (n) Tip",
          onPress: () => {
            handleEditSense();
          },
          icon: (
            <AppIcon name="edit" branch="feather" size={20} color="warning" />
          ),
          color: theme.warning,
          rightContent: (
            <AppIcon
              name="chevron-right"
              branch="feather"
              size={20}
              color="subText1"
            />
          ),
        },
        {
          icon: (
            <AppIcon name="plus" branch="feather" size={20} color="success" />
          ),
          label: "Create new sense",
          onPress: () => {
            handleAddSense();
          },
          color: theme.success,
          rightContent: (
            <AppIcon
              name="chevron-right"
              branch="feather"
              size={20}
              color="subText1"
            />
          ),
        },
        {
          icon: (
            <AppIcon name="trash" branch="feather" size={20} color="white" />
          ),
          label: "Clear custom sense", // Nếu của người dùng thì xóa user đi, còn nếu là official thì sẽ là ẩn,
          onPress: () => {
            setMode("update");
          },
          rightContent: (
            <AppIcon
              name="chevron-right"
              branch="feather"
              size={20}
              color="white"
            />
          ),
          backgroundColor: theme.error,
          color: theme.white,
        },
      ],
    });
  };
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        title={
          <AppText
            numberOfLines={1}
            font="MulishSemiBold"
            color="primary"
            size={"2xl"}
          >
            Tip
          </AppText>
        }
        rightElement={
          <View className="flex-row gap-2 items-center">
            {mode === "view" ? (
              <View
              // exiting={SlideOutDown}
              >
                <ToggleWordDisplayMode
                  languageMode={languageMode}
                  setLanguageMode={setLanguageMode}
                />
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

            <Pressable hitSlop={10} onPress={showMoreMenu}>
              <AppIcon
                name="more-vertical"
                branch="feather"
                size={36}
                color="subText1"
              />
            </Pressable>
          </View>
        }
      />
    </View>
  );
};

export default WordDetailHeader;

const WordMoreMenu = () => {
  const { theme } = useTheme();
  return (
    <View>
      <Animated.View
        className={"h-8 w-8 items-center justify-center"}
        layout={LinearTransition}
        style={[
          {
            backgroundColor: theme.secondary,
            // borderWidth: 0.5,
            elevation: 4,
            shadowColor: theme.secondary,
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
          color="white"
          size={20}
          // color={theme.secondary}
        />
      </Animated.View>

      <View className="flex-row gap-2">
        <AppButton
          onPress={() => {
            // router.push(`/screens/Word/Update/${1}`);
            // handleAddSense();
            // setMode((prev) => (prev === "view" ? "update" : "view"));
          }}
          type={"view" === "view" ? "primary" : "success"}
        >
          <AppIcon name={"plus"} branch="antd" size={18} color="white" />
          <AppText color="white">Sense</AppText>
        </AppButton>
      </View>
    </View>
  );
};
