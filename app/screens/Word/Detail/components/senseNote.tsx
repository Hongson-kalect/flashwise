import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import { AppPressable } from "@/components/AppPressable";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { FontAwesome } from "@expo/vector-icons";
import { View } from "react-native";
import { Divider } from "react-native-paper";
import Animated, { LinearTransition } from "react-native-reanimated";

type Props = {
  note: string;
  word: string;
  onAddNote?: () => void;
  onEditNote?: () => void;
  onDeleteNote?: () => void;
};

const SenseNote = (props: Props) => {
  const { theme } = useTheme();
  const { setGlobalModal } = useModalStore();
  const showNoteModal = () => {
    setGlobalModal({
      type: "menu",
      title: "Note options",
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
          onPress: showEditNoteModal,
          label: "Edit note",
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
          label: "Delete Note",
          onPress: deleteNote,
        },
      ],
    });
  };

  const showAddNoteModal = () => {
    setTimeout(
      () =>
        setGlobalModal({
          type: "prompt",
          title: "Add note 📝",
          placeholder: `Note for "${props.word}"`,
        }),
      500,
    );
  };

  const showEditNoteModal = () => {
    setTimeout(
      () =>
        setGlobalModal({
          type: "prompt",
          title: "Edit note 📝",
          defaultValue: props.note,
        }),
      500,
    );
  };

  const deleteNote = () => {
    setGlobalModal({
      type: "confirm",
      message: "Do you want to delete this note?",
      onOk: () => {},
    });
  };

  return (
    <Animated.View className={"mt-2"} layout={LinearTransition}>
      <AppPressable
        onLongPress={true ? showNoteModal : undefined}
        onPress={true ? undefined : showAddNoteModal}
        style={{ marginHorizontal: -8, paddingHorizontal: 8 }}
      >
        <View className="flex-row items-center gap-2 h-8">
          <FontAwesome
            style={{ width: 14 }}
            name="sticky-note"
            size={14}
            color={theme.title}
          />
          <AppTitle title="Note" />
        </View>
        {!props.note ? (
          <View className="flex-row justify-start">
            <AppButton
              type="success"
              onPress={() => alert("Add Note")}
              size="sm"
            >
              <AppIcon branch="antd" name={"plus"} size={16} color="white" />
              <AppText color="white" size={"xs"}>
                Add note
              </AppText>
            </AppButton>
          </View>
        ) : (
          // <View className="flex-row items-center gap-2 bg-gray-100 py-2 px-1 rounded-lg">
          //   {/* <AppAddIcon size="sm" /> */}
          //   <AppIcon branch="antd" name={"plus"} size={18} color="success" />
          //   <AppText color="subText2" size={"sm"}>
          //     Add note
          //   </AppText>
          // </View>
          <View>
            {/* <AppText color="title" size={"md"} font="MulishSemiBoldItalic">
              Note 📝
            </AppText> */}
            <Divider />
            <View className="py-2">
              <View>
                <AppText
                  size={"sm"}
                  className="mt-1"
                  color="subText2"
                  font="MulishRegularItalic"
                >
                  {props.note}
                </AppText>
              </View>
            </View>
          </View>
        )}
      </AppPressable>
    </Animated.View>
  );
};

export default SenseNote;
