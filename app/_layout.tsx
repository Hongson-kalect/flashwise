import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "./globals.css";

import { AppWrapper } from "@/components/AppWrapper";
import { LanguageProvider } from "@/providers/Language";
import { ThemeProvider } from "@/providers/Theme";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppWrapper>
          <Stack
            screenOptions={{ headerShown: false }}
            // initialRouteName="screens/Card/Create/screen"
          >
            <Stack.Screen name="tabs" />
            <Stack.Screen name="screens/Card/Create/screen" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </AppWrapper>
        <StatusBar style="auto" />
      </LanguageProvider>
    </ThemeProvider>
  );
}
