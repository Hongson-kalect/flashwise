import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { setMainSense } from "@/services/api/senses";
import { useContext, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { SenseSavedContext } from "../senseEdit";
import { SenseType } from "../../data";
import { toast } from "@/utils/toast";

/**
 * Dấu sao "nghĩa chính của tôi" + huy hiệu "Đề xuất" khi admin đã đề xuất nghĩa này.
 * Chạm sao: đặt nghĩa này làm nghĩa chính của từ (nghĩa chính trước đó của từ bị thu hồi), trang tải lại và nghĩa chính
 * cùng loại từ của nó nhảy lên đầu. Chạm lại: bỏ.
 */
const MainSenseButton = ({ sense }: { sense: SenseType }) => {
  const { theme } = useTheme();
  const refresh = useContext(SenseSavedContext);
  const [main, setMain] = useState(!!sense.is_main);
  const [busy, setBusy] = useState(false);

  useEffect(() => setMain(!!sense.is_main), [sense.id, sense.is_main]);

  const toggle = async () => {
    if (busy) return;
    const want = !main;
    setMain(want); // hiện ngay, lỗi thì trả lại
    setBusy(true);
    try {
      await setMainSense(sense.id, want);
      refresh();
      try {
        toast.success(want ? "Đã đặt làm nghĩa chính của bạn" : "Đã bỏ nghĩa chính");
      } catch {}
    } catch {
      setMain(!want);
      try {
        toast.error("Không đặt được, kiểm tra mạng");
      } catch {}
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-row items-center gap-2">
      {sense.recommended ? (
        <View
          className="flex-row items-center gap-1 px-2 h-7 rounded-full"
          style={{ backgroundColor: theme.accent + "26" }}
        >
          <AppIcon branch="feather" name="award" size={13} color={theme.accent} />
          <AppText size="xs" weight="semibold" style={{ color: theme.accent }}>
            Đề xuất
          </AppText>
        </View>
      ) : null}
      <Pressable
        onPress={toggle}
        hitSlop={10}
        className="h-10 w-10 rounded-full items-center justify-center"
        style={{
          backgroundColor: main ? theme.accent + "26" : theme.card,
          borderWidth: 1,
          borderColor: main ? theme.accent : theme.border,
        }}
        accessibilityLabel={main ? "Bỏ nghĩa chính" : "Đặt làm nghĩa chính"}
      >
        <AppIcon branch="antd" name={main ? "star" : "staro"} size={20} color={main ? theme.accent : theme.subText2} />
      </Pressable>
    </View>
  );
};

export default MainSenseButton;
