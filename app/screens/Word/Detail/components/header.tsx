import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { Dispatch, SetStateAction, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { extractObjectByPath, testAPIStreamData } from "../../data";
import CreateSenseSheet, { SenseType } from "./createSenseSheet";
import ToggleWordDisplayMode from "./toggleWordDisplayMode";

type Props = {
  mode?: "create" | "update" | "view";
  word: string;
  isLoading: boolean;
  setMode: Dispatch<SetStateAction<"update" | "view">>;
  languageMode: 1 | 2;
  setLanguageMode: Dispatch<SetStateAction<1 | 2>>;
};
const WordDetailHeader = ({
  word,
  mode,
  isLoading,
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
      title: `Add sense - ${word[0].toUpperCase() + word.slice(1)}`,
      size: "full",
      render: () => (
        <CreateSenseSheet
          word={word}
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
      title: `Add sense - (n) ${word[0].toUpperCase() + word.slice(1)}`,
      size: "full",
      render: () => (
        <CreateSenseSheet
          word={word}
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
          label: `Edit sense - (n) ${word[0].toUpperCase() + word.slice(1)}`,
          onPress: () => {
            handleEditSense();
          },
          icon: (
            <AppIcon name="edit" branch="feather" size={24} color="warning" />
          ),
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
            <AppIcon name="plus" branch="feather" size={24} color="success" />
          ),
          label: "Create new sense",
          onPress: () => {
            handleAddSense();
          },
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

  const testData = testAPIStreamData;

  const getSpecificData = () => {
    // accumulatedText += decoder.decode(value, { stream: true });
    const startTime = performance.now();
    let accumulatedText = testData; // streaming text to now
    let flagsFound = false;
    let firstSenseFound = false;

    // 1. CHECK FLAGS (Ưu tiên số 1)
    if (!flagsFound) {
      const flagsMatch = extractObjectByPath(accumulatedText, '"flags"');
      if (flagsMatch) {
        const flags = JSON.parse(flagsMatch);
        const timeFlags = (performance.now() - startTime).toFixed(2);
        console.log(`🛡️ Flags detected at ${timeFlags}ms:`, flags);

        // Xử lý che chắn ngay lập tức
        if (flags.isOffensive) {
          console.warn("CẢNH BÁO: Từ tục tịu! Kích hoạt chế độ che chắn.");
          // Hiển thị cảnh báo hoặc ẩn nội dung nhạy cảm tại đây
        }
        if (!flags.isValid) {
          console.error("Từ không hợp lệ.");
          // Có thể dừng stream hoặc báo lỗi
        }

        flagsFound = true;

        // return flags;
      }
    }

    // 2. NHẶT SENSE ĐẦU TIÊN (Ưu tiên số 2)
    if (flagsFound && !firstSenseFound) {
      const senseMatch = extractObjectByPath(accumulatedText, '"senses"', true); // true để lấy phần tử đầu tiên trong mảng
      if (senseMatch) {
        const sense = JSON.parse(senseMatch);
        const timeSense = (performance.now() - startTime).toFixed(2);
        console.log(`✅ First Sense detected at ${timeSense}ms`);

        firstSenseFound = true;
        return sense || { text: "Có éo gì đâu" };
      }
    }
  };

  return (
    <>
      <View className="flex-row justify-between items-center">
        <AppReturnHeader
          title={
            <View className="flex-row items-center gap-2">
              <AppText
                numberOfLines={1}
                font="MulishSemiBold"
                color="primary"
                size={"2xl"}
              >
                {word[0].toUpperCase() + word.slice(1)}
              </AppText>
              {isLoading && (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                  className="animate-spin"
                >
                  <AppIcon
                    size={20}
                    color="secondary"
                    branch="feather"
                    name={"loader"}
                  />
                </Animated.View>
              )}
            </View>
          }
          rightElement={
            <View className="flex-row gap-4 items-center">
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

              <TouchableOpacity
                hitSlop={10}
                onPress={showMoreMenu}
                className="h-8"
              >
                <View className="items-end justify-between h-full">
                  <View
                    style={{
                      height: 4,
                      elevation: 4,
                      borderRadius: 100,
                      width: 28,
                      backgroundColor: "#555",
                    }}
                  />
                  <View
                    style={{
                      height: 4,
                      elevation: 4,
                      borderRadius: 100,
                      width: 20,
                      backgroundColor: "#555",
                    }}
                  />
                  <View
                    style={{
                      height: 4,
                      elevation: 4,
                      borderRadius: 100,
                      width: 12,
                      backgroundColor: "#555",
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* <AppText>{JSON.stringify(getSpecificData())}</AppText> */}
    </>
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
