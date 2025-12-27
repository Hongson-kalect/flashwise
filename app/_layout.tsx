import { SplashScreen, Stack } from "expo-router";
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
import { DATABASE_NAME } from "@/configs/database";
import { fonts } from "@/configs/fonts";
import { initDatabase } from "@/database/schema";
import { BottomSheetProvider } from "@/providers/BottomSheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense, useEffect, useState } from "react";
import { MenuProvider } from "react-native-popup-menu";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [hasSeenStart, setHasSeenStart] = useState<boolean | null>(null);

  SplashScreen.preventAutoHideAsync();

  useEffect(() => {
    async function loadFonts() {
      try {
        console.log("loading font...");
        await Font.loadAsync(fonts);
        setFontsLoaded(true);
        const seen = await AsyncStorage.getItem("hasSeenStartPage");
        setHasSeenStart(seen === "true");
        console.log(seen);
        // if (seen === "true") router.replace("/screens/Start/screen");
      } catch (err) {
        console.log(err);
        setHasSeenStart(false);
      } finally {
        setIsReady(true);
      }
    }

    loadFonts();
  }, []);

  useEffect(() => {
    if (isReady && hasSeenStart !== null) {
      SplashScreen.hideAsync();
    }
  }, [isReady, hasSeenStart]);

  if (!isReady) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MenuProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider>
              <LanguageProvider>
                <BottomSheetProvider>
                  <Suspense>
                    <SQLiteProvider
                      databaseName={DATABASE_NAME}
                      onInit={initDatabase}
                    >
                      <AppWrapper>
                        <Stack
                          screenOptions={{ headerShown: false }}
                          initialRouteName={
                            hasSeenStart ? "tabs" : "screens/Start/screen"
                          }
                        >
                          <Stack.Screen name="tabs" />
                          <Stack.Screen name="screens/Start/screen" />
                          <Stack.Screen name="screens/Card/Create/screen" />
                          <Stack.Screen name="+not-found" />
                        </Stack>
                      </AppWrapper>
                    </SQLiteProvider>
                  </Suspense>
                </BottomSheetProvider>

                {/* <Toast /> */}
                {/* <AppUsageTracker /> */}
                <AppRecording />
                <Portal>
                  <ListModal />
                  <GlobalModal />
                </Portal>
                {/* <StatusBar style="auto" /> */}
              </LanguageProvider>
            </Provider>
          </GestureHandlerRootView>
        </MenuProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
