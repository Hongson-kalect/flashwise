import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import useModalStore from "@/stores/modalStore";
import { Dispatch, SetStateAction, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { extractObjectByPath, testAPIStreamData } from "../../data";
import AddSenseSheet from "./addSenseSheet";
import { useSenseEditor } from "../senseEdit";
import { deleteSense, fetchMySenses, hideSense, unhideSense } from "@/services/api/senses";
import { toast } from "@/utils/toast";
import { markSenseRemoved } from "@/database/queries/words";
import { useSQLiteContext } from "expo-sqlite";
import { useQueryClient } from "@tanstack/react-query";
import ToggleWordDisplayMode from "./toggleWordDisplayMode";

type Props = {
  mode?: "create" | "update" | "view";
  word: string;
  /** id từ (để lấy gợi ý nghĩa cộng đồng); chưa có khi từ còn đang tạo. */
  wordId?: string;
  /** Các nghĩa đang có của từ (để người dùng đối chiếu trước khi thêm). */
  senses?: Record<string, any>;
  /** Gọi sau khi thêm nghĩa (chính thức hoặc chờ duyệt) để trang tải lại. */
  onSenseAdded?: () => void;
  /** Nghĩa đang xem (để "Sửa nghĩa này" mở form đã điền sẵn). */
  activeSense?: any;
  isLoading: boolean;
  setMode: Dispatch<SetStateAction<"update" | "view">>;
};
const WordDetailHeader = ({ word, wordId, senses, onSenseAdded, activeSense, mode, isLoading, setMode }: Props) => {
  const { theme } = useTheme();
  const { present } = useBottomSheet();
  const addModal = useModalStore((state) => state.addModal);
  const { settings, dbService } = useAppStore();
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  const handleAddSense = () =>
    present({
      title: `Thêm nghĩa · ${word[0].toUpperCase() + word.slice(1)}`,
      size: "long",
      render: () => (
        <AddSenseSheet
          word={word}
          wordId={wordId}
          senses={senses}
          onAdded={onSenseAdded}
        />
      ),
    });

  const { edit, canEdit } = useSenseEditor({ sense: activeSense, onSaved: onSenseAdded });

  const confirmRemove = (kind: "hide" | "delete", own = false) => {
    const id = activeSense?.id;
    if (!id) return;
    addModal({
      type: "confirm",
      title: kind === "hide" ? "Ẩn nghĩa này?" : "Xoá nghĩa này?",
      message:
        kind === "delete"
          ? "Nghĩa do bạn tạo và chưa phát hành trong bộ từ. Xoá xong không thể hoàn tác."
          : own
            ? "Nghĩa đã phát hành trong bộ từ nên không xoá được, chỉ ẩn khỏi trang từ của riêng bạn. Người khác vẫn dùng được."
            : "Nghĩa sẽ chỉ bị ẩn khỏi trang từ của riêng bạn, người khác vẫn thấy. Bỏ ẩn lại trong menu ba chấm.",
      okText: kind === "hide" ? "Ẩn" : "Xoá",
      cancelText: "Huỷ",
      onOk: async () => {
        try {
          if (kind === "hide") await hideSense(id);
          else await deleteSense(id);
          await markSenseRemoved(db, id, true).catch(() => {}); // bản lưu local không còn nghĩa này
          queryClient.invalidateQueries({ queryKey: ["words"] });
          onSenseAdded?.(); // tải lại trang từ
        } catch (e: any) {
          const code = e?.response?.data?.errorCode;
          const status = e?.response?.status;
          toast.error(
            !e?.response
              ? "Không có kết nối, thử lại sau."
              : code === "sense_frozen"
                ? "Nghĩa đã phát hành trong bộ từ nên không xoá được."
                : status === 403
                  ? "Chỉ xoá được nghĩa do chính bạn tạo."
                  : "Chưa thực hiện được, thử lại sau.",
          );
        }
      },
    });
  };

  const unhideAll = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(unhideSense));
      await Promise.all(ids.map((id) => markSenseRemoved(db, id, false).catch(() => {})));
      queryClient.invalidateQueries({ queryKey: ["words"] });
      onSenseAdded?.(); // tải lại trang từ
    } catch {
      toast.error("Chưa bỏ ẩn được, thử lại sau.");
    }
  };

  const showMoreMenu = async () => {
    const title = word[0].toUpperCase() + word.slice(1);
    // Quyền sở hữu và các nghĩa đang ẩn lấy từ server mỗi lần mở menu (offline thì chỉ còn "Ẩn nghĩa này")
    let mineIds = new Map<string, boolean>(); // id nghĩa của mình -> đã đóng băng (bản lưu local không có is_frozen nên lấy từ server)
    let hidden: string[] = [];
    if (wordId) {
      try {
        const mine = await fetchMySenses(wordId);
        mineIds = new Map(mine.senses.map((s) => [s.id, !!s.is_frozen]));
        hidden = mine.hidden;
      } catch {}
    }
    const own = !!activeSense?.id && mineIds.has(activeSense.id) && !activeSense.is_official;
    // Chỉ nghĩa tuỳ chỉnh của mình chưa đóng băng mới xoá thật; còn lại (chính thức, của người khác, của mình đã phát hành) chỉ ẩn
    const removable = own && !mineIds.get(activeSense.id);
    addModal({
      type: "menu",
      title: `Tuỳ chọn · ${title}`,
      menuOptions: [
        {
          label: "Sửa nghĩa này",
          onPress: () => edit(),
          disabled: !canEdit,
          icon: <AppIcon name="edit-2" branch="feather" size={20} color="primary" />,
        },
        {
          label: "Thêm nghĩa mới",
          onPress: handleAddSense,
          icon: <AppIcon name="plus" branch="feather" size={20} color="primary" />,
        },
        ...(activeSense?.id
          ? [
              removable
                ? {
                    label: "Xoá nghĩa này",
                    destructive: true,
                    onPress: () => confirmRemove("delete"),
                    icon: <AppIcon name="trash-2" branch="feather" size={20} color="error" />,
                  }
                : {
                    label: "Ẩn nghĩa này",
                    destructive: true,
                    onPress: () => confirmRemove("hide", own),
                    icon: <AppIcon name="eye-off" branch="feather" size={20} color="error" />,
                  },
            ]
          : []),
        ...(hidden.length
          ? [
              {
                label: `Bỏ ẩn tất cả (${hidden.length})`,
                onPress: () => unhideAll(hidden),
                icon: <AppIcon name="eye" branch="feather" size={20} color="primary" />,
              },
            ]
          : []),
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
                font="MulishBold"
                size={"3xl"}
              >
                {word[0].toUpperCase() + word.slice(1)}
              </AppText>
            </View>
          }
          rightElement={
            <View className="flex-row gap-4 items-center">
              {mode === "view" ? (
                <View
                // exiting={SlideOutDown}
                >
                  <ToggleWordDisplayMode />
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
                className="h-9 w-9 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.card }}
              >
                <AppIcon name="more-horizontal" branch="feather" size={20} color="text" />
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
