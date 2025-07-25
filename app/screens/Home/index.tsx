import AppText from "@/components/AppText";
import { useLanguage, useT } from "@/providers/Language";
import { useTheme } from "@/providers/Theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HomePage() {
  const { theme } = useTheme();
  const { t } = useT();
  const { language, setLanguage } = useLanguage();

  return (
    <View>
      <AppText style={{ color: theme.text }}>
        HomePage here {t("hello", { name: "John" })}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({});
