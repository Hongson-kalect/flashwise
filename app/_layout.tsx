import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "./globals.css";

import { AppWrapper } from "@/components/AppWrapper";
import { ListModal } from "@/components/modals/OptionModal";
import { LanguageProvider } from "@/providers/Language";
import { GlobalModal } from "@/providers/Modal";
import { ThemeProvider } from "@/providers/Theme";
import * as Font from "expo-font";
import { Portal, Provider } from "react-native-paper";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import AppRecording from "@/components/AppRecording";
import { fonts } from "@/configs/fonts";
import { BottomSheetProvider } from "@/providers/BottomSheet";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  SplashScreen.preventAutoHideAsync();

  useEffect(() => {
    async function loadFonts() {
      console.log("loading font...");
      await Font.loadAsync(fonts);
      setFontsLoaded(true);
      await SplashScreen.hideAsync();
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Provider>
            <LanguageProvider>
              <BottomSheetProvider>
                <AppWrapper>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="tabs" />
                    <Stack.Screen name="screens/Card/Create/screen" />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </AppWrapper>
              </BottomSheetProvider>

              {/* <Toast /> */}
              {/* <AppUsageTracker /> */}
              <AppRecording />
              <Portal>
                <ListModal />
                <GlobalModal />
              </Portal>
              <StatusBar style="auto" />
            </LanguageProvider>
          </Provider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
