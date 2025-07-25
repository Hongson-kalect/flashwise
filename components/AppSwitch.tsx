import { useTheme } from "@/providers/Theme";
import React from "react";
import { View, Switch, StyleSheet } from "react-native";

interface AppSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  size?: keyof typeof switchSizes; // optional scale
  type?: "primary" | "secondary" | "success" | "error" | "warning";
}

const switchSizes = {
  xs: 0.5,
  sm: 0.75,
  md: 1,
  lg: 1.25,
  xl: 1.5,
  "2xl": 2,
};

export const AppSwitch = ({
  value,
  onValueChange,
  size = "md",
  type = "primary",
}: AppSwitchProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={[styles.container, { transform: [{ scale: switchSizes[size] }] }]}
    >
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? theme[type] : "#f4f3f4"}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
});
