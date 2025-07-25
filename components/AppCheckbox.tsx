import { useTheme } from "@/providers/Theme";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppText from "./AppText";

type Props = {
  checked: boolean;
  onChange: () => void;
  direction?: "row" | "column";
  label?: string;
  customLabel?: React.ReactNode;
  type?: "primary" | "secondary" | "success" | "error" | "warning";
  disabled?: boolean;
  scale?: number;
};

const AppCheckbox = ({
  checked,
  onChange,
  label,
  disabled,
  direction = "row",
  customLabel,
  scale,
  type = "primary",
}: Props) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onChange}
      activeOpacity={0.8}
      disabled={disabled}
      style={{
        flexDirection: direction,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: theme[type],
            backgroundColor: checked ? theme[type] : "#fff",
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale: scale || 1 }], // Apply scaling if provided
          },
        ]}
      >
        {checked && <View style={styles.tick} />}
      </View>
      {customLabel || label ? (
        <AppText style={styles.label} color="text">
          {customLabel || label}
        </AppText>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  tick: {
    width: 10,
    height: 10,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
});

export default AppCheckbox;
