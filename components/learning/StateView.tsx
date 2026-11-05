import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";

type Action = { label: string; onPress: () => void; primary?: boolean };

type Props = {
  icon: string;
  tone?: "primary" | "success" | "warning" | "error";
  title: string;
  message?: string;
  /** Khối thêm giữa lời nhắn và nút (vd số liệu phiên). */
  children?: ReactNode;
  actions: Action[];
};

/** Màn trạng thái toàn khung: hết từ mới, lỗi, học xong. Một khuôn cho mọi trường hợp để các màn học nhìn đồng nhất. */
const StateView = ({ icon, tone = "primary", title, message, children, actions }: Props) => {
  const { theme } = useTheme();
  const color = theme[tone];
  return (
    <View className="flex-1 items-center justify-center px-8 gap-4">
      <View className="h-20 w-20 rounded-full items-center justify-center" style={{ backgroundColor: color + "1F" }}>
        <AppIcon branch="feather" name={icon as any} size={34} color={color} />
      </View>
      <AppText size="2xl" weight="bold" color="title" textAlign="center">
        {title}
      </AppText>
      {!!message && (
        <AppText color="subText1" textAlign="center">
          {message}
        </AppText>
      )}
      {children}
      <View className="w-full gap-3 pt-2">
        {actions.map((a) => (
          <Pressable
            key={a.label}
            onPress={a.onPress}
            className="h-14 rounded-2xl items-center justify-center"
            style={a.primary ? { backgroundColor: theme.primary } : { borderWidth: 1.5, borderColor: theme.border }}
          >
            <AppText size="lg" weight="bold" color={a.primary ? "white" : "title"}>
              {a.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default StateView;
