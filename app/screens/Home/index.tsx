import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useLanguage, useT } from "@/providers/Language";
import { useTheme } from "@/providers/Theme";
import { StyleSheet, View } from "react-native";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const t = useT();
  const { language, setLanguage } = useLanguage();
  const { present } = useBottomSheet();

  const openSheet = (size: "short" | "medium" | "long" | "full") => {
    present({
      render: () => <AppText>Sheet {size}</AppText>,
      title: "Sheet " + size,
      size,
    });
  };

  return (
    <View
      className="p-2 gap-2"
      style={{ backgroundColor: theme.background, flex: 1 }}
    >
      <AppText style={{ color: theme.text }}>
        HomePage here {t("hello", { name: "John" })}
      </AppText>

      <AppButton
        title="To VN language"
        onPress={() => setLanguage("vi")}
        type="primary"
        // disabled
      ></AppButton>
      <AppButton
        title="To EN language"
        onPress={() => setLanguage("en")}
        type="secondary"
      ></AppButton>
      <AppButton
        title="Dark mode"
        onPress={() => setTheme("dark")}
        type="error"
      ></AppButton>
      <AppButton
        title="Light mode"
        onPress={() => setTheme("light")}
        type="success"
      ></AppButton>
      <AppButton
        title="Test short sheet modal"
        onPress={() => openSheet("short")}
        type="success"
      ></AppButton>
      <AppButton
        title="Test medium sheet modal"
        onPress={() => openSheet("medium")}
        type="success"
      ></AppButton>
      <AppButton
        title="Test long sheet modal"
        onPress={() => openSheet("long")}
        type="success"
      ></AppButton>
      <AppButton
        title="Test full sheet modal"
        onPress={() => openSheet("full")}
        type="success"
      ></AppButton>
    </View>
  );
}

const styles = StyleSheet.create({});
