import AppText from "@/components/AppText";
import { BasicModalOptions, MenuModalOptions } from "@/providers/Modal";
import useModalStore from "@/stores/modalStore";
import { ScrollView, TouchableOpacity, View } from "react-native";

type Props = MenuModalOptions & BasicModalOptions;

const MenuModal = (modal: Props) => {
  const { globalModal, setGlobalModal } = useModalStore();
  const menuType = modal.menuOptions.some((item) => item.rightContent)
    ? "space-between"
    : "center";

  return (
    <View>
      {modal.menuTitle && (
        <AppText
          style={{ fontFamily: "PlaypenSans-Semibold" }}
          className="text-xl mb-4"
        >
          {modal.menuTitle}
        </AppText>
      )}
      <ScrollView>
        {modal.menuOptions.map((menu, idx) => (
          <TouchableOpacity
            key={idx}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: menuType,
              borderBottomWidth: 0.5,
              backgroundColor: menu.backgroundColor || "transparent",
              borderColor:
                idx === modal.menuOptions.length - 1
                  ? "transparent"
                  : "rgba(0, 0, 0, 0.1)",
            }}
            className="py-3 px-2 rounded-lg"
            onPress={() => {
              menu.onPress?.();
              if (menu.isCloseAfterPress !== false) setGlobalModal(null);
            }}
          >
            <View className="flex-row items-center justify-center gap-2">
              {menu.icon}
              <AppText
                style={{ color: menu.color || "#333" }}
                className="text-center text-lg"
              >
                {menu.label}
              </AppText>
            </View>
            {menu.rightContent}
          </TouchableOpacity>
        ))}
      </ScrollView>
      {modal.cancelText && (
        <TouchableOpacity
          className="mt-4 py-2"
          onPress={() => {
            setGlobalModal(null);
          }}
        >
          <AppText className="text-center text-gray-500 text-base">
            {modal.cancelText || "Cancel"}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MenuModal;
