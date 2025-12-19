import AppAddIcon from "@/components/AppAddIcon";
import AppIcon from "@/components/AppIcon";
import { AppPressable } from "@/components/AppPressable";
import AppText from "@/components/AppText";
import useModalStore from "@/stores/modalStore";
import { View } from "react-native";
import { Divider } from "react-native-paper";
import Animated, { LinearTransition } from "react-native-reanimated";

type Props = {
  note: { id: string; value: string };
  word: string;
  onAddNote?: () => void;
  onEditNote?: () => void;
  onDeleteNote?: () => void;
};

const SenseNote = (props: Props) => {
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
      500
    );
  };

  const showEditNoteModal = () => {
    setTimeout(
      () =>
        setGlobalModal({
          type: "prompt",
          title: "Edit note 📝",
          defaultValue: props.note.value,
        }),
      500
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
    <Animated.View layout={LinearTransition}>
      <AppPressable
        onLongPress={true ? showNoteModal : undefined}
        onPress={true ? undefined : showAddNoteModal}
        style={{ marginHorizontal: -8, paddingHorizontal: 8 }}
        className="mt-4 bg-gray-100 rounded-lg py-4"
      >
        {false ? (
          <View className="flex-row items-center justify-between">
            <AppText color="subText2" font="MulishLightItalic" size={"sm"}>
              No note for now
            </AppText>

            <AppAddIcon size="sm" />
          </View>
        ) : (
          <View>
            <AppText color="title" size={"md"} font="MulishSemiBoldItalic">
              Note 📝
            </AppText>
            <Divider />
            <View className="py-2">
              <View>
                {props.note.value && (
                  <AppText
                    size={"sm"}
                    color="subText2"
                    font="MulishRegularItalic"
                  >
                    {props.note.value}
                  </AppText>
                )}
              </View>
            </View>
          </View>
        )}
      </AppPressable>
    </Animated.View>
  );
};

export default SenseNote;
