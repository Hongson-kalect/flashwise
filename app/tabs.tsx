import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { haptic } from "@/ui";
import { toast } from "@/utils/toast";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { BackHandler, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CollectionsPage from "./screens/Collection";
import HomePage from "./screens/Home";
import ProfilePage from "./screens/Profile";
import CardPage from "./screens/Word/List";

const TABS = [
  { key: "home", label: "Trang chủ", icon: "home", Page: HomePage },
  { key: "collections", label: "Bộ từ", icon: "layers", Page: CollectionsPage },
  { key: "cards", label: "Từ vựng", icon: "book-open", Page: CardPage },
  { key: "profile", label: "Cá nhân", icon: "user", Page: ProfilePage },
] as const;

/**
 * Thanh tab dưới cùng: icon + nhãn, tab đang chọn có nền xanh nhạt.
 * Mỗi tab chỉ dựng khi mở lần đầu rồi giữ nguyên (không mất vị trí cuộn / dữ liệu khi chuyển tab).
 */
export default function Layout() {
  const { theme } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);

  // Nút Back của máy ở màn tab: tab khác về Trang chủ trước; ở Trang chủ phải bấm 2 lần (trong 2 giây) mới thoát app.
  // Chỉ gắn khi màn tab đang được xem (vào màn con thì Back quay lại như bình thường).
  const lastBack = useRef(0);
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (active !== 0) {
          setActive(0);
          return true;
        }
        const now = Date.now();
        if (now - lastBack.current < 2000) return false; // lần 2: để hệ thống thoát app
        lastBack.current = now;
        toast.info("Nhấn Back lần nữa để thoát");
        return true;
      });
      return () => sub.remove();
    }, [active]),
  );

  const select = (i: number) => {
    if (i !== active) haptic("selection");
    setActive(i);
    setVisited((v) => (v.includes(i) ? v : [...v, i]));
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1 }}>
        {TABS.map(({ key, Page }, i) =>
          visited.includes(i) ? (
            <View
              key={key}
              style={{ flex: 1, display: i === active ? "flex" : "none" }}
            >
              <Page />
            </View>
          ) : null,
        )}
      </View>

      <View
        className="flex-row px-2 pt-2"
        style={{
          paddingBottom: Math.max(bottom, 8),
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        }}
      >
        {TABS.map((t, i) => {
          const on = i === active;
          return (
            <Pressable
              key={t.key}
              onPress={() => select(i)}
              className="flex-1 items-center gap-0.5"
            >
              <View
                className="h-8 w-16 items-center justify-center rounded-full"
                style={{
                  backgroundColor: on ? theme.primary + "1F" : "transparent",
                }}
              >
                <AppIcon
                  branch="feather"
                  name={t.icon}
                  size={20}
                  color={on ? theme.primary : theme.subText2}
                />
              </View>
              <AppText
                size="tiny"
                font={on ? "MulishBold" : "MulishMedium"}
                style={{ color: on ? theme.primary : theme.subText2 }}
              >
                {t.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
