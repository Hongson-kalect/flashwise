import AppAddIcon from "@/components/AppAddIcon";
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
  word: string;
  languageMode: 1 | 2;
  usage?: { id: string; value: string; translate: string } | null;
};

const SenseUsage = (props: Props) => {
  const { theme } = useTheme();
  const { setGlobalModal } = useModalStore();

  const showUsageModal = () => {
    setGlobalModal({
      type: "menu",
      title: "Usage options",
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
          onPress: showEditUsageModal,
          label: "Edit usage",
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
          label: "Delete custom usage",
          onPress: deleteUsage,
        },
      ],
    });
  };

  const showUsageTranslateModal = () => {
    setGlobalModal({
      type: "menu",
      title: "Usage translate options",
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
          onPress: showEditUsageTranslateModal,
          label: "Edit Vietnamese usage",
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
          label: "Delete custom usage",
          onPress: deleteUsageTranslate,
        },
      ],
    });
  };

  const showEditUsageModal = () => {
    setTimeout(() => {
      setGlobalModal({
        title: "Edit usage",
        type: "prompt",
        defaultValue: props.usage?.value,
      });
    }, 500);
  };

  const showEditUsageTranslateModal = () => {
    setTimeout(() => {
      setGlobalModal({
        title: "Edit usage",
        type: "prompt",
        defaultValue: props.usage?.translate,
      });
    }, 500);
  };

  const showAddUsageModal = () => {
    setGlobalModal({
      title: "Add usage",
      type: "prompt",
      placeholder: `English usage for "${props.word}"`,
    });
  };

  const showAddUsageTranslateModal = () => {
    setGlobalModal({
      title: "Add usage",
      type: "prompt",
      placeholder: `Vietnamese usage for "${props.word}"`,
    });
  };

  const deleteUsage = () => {
    setTimeout(() => {
      setGlobalModal({
        type: "confirm",
        message: "Do you want to delete this usage?",
        onOk: () => {},
      });
    }, 500);
  };

  const deleteUsageTranslate = () => {
    setTimeout(() => {
      setGlobalModal({
        type: "confirm",
        message: "Do you want to delete this usage?",
        onOk: () => {},
      });
    }, 500);
  };

  return (
    <Animated.View className={"mt-2"} layout={LinearTransition}>
      <View className="flex-row items-center gap-2 h-8">
        <FontAwesome
          style={{ width: 14 }}
          name="search"
          size={14}
          color={theme.title}
        />
        <AppTitle title="Usage" />
      </View>
      <Divider />
      {props?.usage?.value ? (
        <AppPressable onLongPress={showUsageModal} hitSlop={8} className="py-2">
          <AppText color="subText1">{props.usage.value}</AppText>
        </AppPressable>
      ) : (
        <AppPressable
          onPress={showAddUsageModal}
          className="py-3 flex-row items-center justify-between"
        >
          <AppText color="subText2" font="MulishRegularItalic" size={"sm"}>
            Not have usage in English
          </AppText>

          <AppAddIcon size="sm" />
        </AppPressable>
      )}

      {props.languageMode === 2 && (
        <View>
          {props?.usage?.translate ? (
            <AppPressable
              onLongPress={showUsageTranslateModal}
              touchColor={theme.secondary + "20"}
              style={{
                marginHorizontal: -8,
                marginTop: 4,
                marginBottom: 8,
                backgroundColor: theme.secondary + "08",
                paddingHorizontal: 8,
              }}
              className="p-3"
            >
              <AppText color="subText1" font="MulishLightItalic" size={"sm"}>
                {props.usage.translate}
              </AppText>
            </AppPressable>
          ) : (
            <AppPressable
              onPress={showAddUsageTranslateModal}
              touchColor={theme.secondary + "20"}
              style={{
                marginHorizontal: -8,
                marginVertical: 8,
                backgroundColor: theme.secondary + "15",
                paddingHorizontal: 8,
              }}
              className="py-3 flex-row items-center justify-between"
            >
              <AppText color="subText2" font="MulishRegularItalic" size={"sm"}>
                Not have usage in Vietnamese
              </AppText>
              <AppAddIcon size="sm" />
            </AppPressable>
          )}
        </View>
      )}
    </Animated.View>
  );
};

export default SenseUsage;
