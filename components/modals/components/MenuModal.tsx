import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { BasicModalOptions, MenuModalOptions } from "@/providers/Modal";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { Pressable, ScrollView, View } from "react-native";
import ModalButton from "../ModalButton";

type Props = MenuModalOptions & BasicModalOptions;

/** Danh sách hành động: mỗi dòng có ô icon bo tròn, nhãn, mũi tên; hành động nguy hiểm tô đỏ nhạt. */
const MenuModal = (modal: Props) => {
  const { setGlobalModal } = useModalStore();

  return (
    <View>
      {modal.title && (
        <AppText className="mb-2 px-1" font="MulishBold" size="xl" color="title">
          {modal.title}
        </AppText>
      )}
      <ScrollView>
        <View className="gap-1">
          {modal.menuOptions.map((menu, idx) => (
            <AppMenu
              key={menu.key ?? idx}
              destructive={menu.destructive}
              color={menu.color}
              backgroundColor={menu.backgroundColor}
              disabled={menu.disabled}
              onPress={() => {
                menu.onPress?.();
                if (menu.isCloseAfterPress !== false) setGlobalModal(null);
              }}
              icon={menu.icon}
              label={menu.label}
              rightContent={menu.rightContent}
            />
          ))}
        </View>
      </ScrollView>
      {modal.cancelText && (
        <View className="mt-3">
          <ModalButton
            variant="ghost"
            label={modal.cancelText}
            onPress={() => setGlobalModal(null)}
          />
        </View>
      )}
    </View>
  );
};

type AppMenuType = {
  /** Hành động phá huỷ (xoá...): nền và chữ đỏ nhạt thay vì nền đỏ đặc. */
  destructive?: boolean;
  disabled?: boolean;
  /** Cũ: màu chữ / nền tuỳ chỉnh. */
  color?: string;
  backgroundColor?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  label?: string | React.ReactNode;
  rightContent?: React.ReactNode;
  /** Cũ, không còn tác dụng (bố cục luôn trái → phải). */
  justifyContent?: "center" | "space-between";
  borderColor?: string;
};

export const AppMenu = (props: AppMenuType) => {
  const { theme } = useTheme();
  const tone = props.destructive ? theme.error : theme.primary;

  return (
    <Pressable
      disabled={props.disabled}
      android_ripple={{ color: tone + "22" }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 16,
        opacity: props.disabled ? 0.45 : 1,
        backgroundColor: props.destructive
          ? theme.error + "12"
          : props.backgroundColor || "transparent",
      }}
      onPress={() => props.onPress?.()}
    >
      {props.icon ? (
        <View
          className="h-10 w-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: tone + "18" }}
        >
          {props.icon}
        </View>
      ) : null}
      <View className="flex-1">
        {typeof props.label === "string" ? (
          <AppText
            font="MulishSemiBold"
            size="md"
            style={{ color: props.destructive ? theme.error : props.color || theme.text }}
          >
            {props.label}
          </AppText>
        ) : (
          props.label
        )}
      </View>
      {props.rightContent ?? (
        <AppIcon
          branch="feather"
          name="chevron-right"
          size={18}
          color={props.destructive ? theme.error + "99" : theme.subText3}
        />
      )}
    </Pressable>
  );
};

export default MenuModal;
