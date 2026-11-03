import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SplashScreen, Stack } from "expo-router";
import "react-native-reanimated";
import "./globals.css";
import "@/configs/ui";

import { AppWrapper } from "@/components/AppWrapper";
import { ListModal } from "@/components/modals/OptionModal";
import { LanguageProvider } from "@/providers/Language";
import { GlobalModal } from "@/providers/Modal";
import { ThemeProvider } from "@/providers/Theme";
import * as Font from "expo-font";
import { Portal } from "react-native-paper";

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
    // wordSocket.connect();
    async function loadFonts() {
      try {
        console.log("loading font...");
        // Nạp sẵn font icon cùng font chữ để icon không nhấp nháy lúc đầu
        await Font.loadAsync({
          ...fonts,
          ...Feather.font,
          ...AntDesign.font,
          ...MaterialIcons.font,
          ...FontAwesome6.font,
        });
        setFontsLoaded(true);
        const hasStarted = await AsyncStorage.getItem("hasSeenStartPage");
        setHasSeenStart(hasStarted === "true");
        console.log(hasStarted);
        // if (hasStarted === "true") router.replace("/screens/Start/screen");
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
            <>
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
                          initialRouteName="index"
                        >
                          <Stack.Screen name="index" />
                          <Stack.Screen name="tabs" />
                          <Stack.Screen name="screens/Start/screen" />
                          <Stack.Screen name="screens/Login/screen" />
                          <Stack.Screen
                            getId={({ params }) => params?.value}
                            singular
                            name="screens/Word/Detail/[value]"
                            dangerouslySingular={false} // Tạo phòng mới hoàn toàn cho mỗi từ khác nhau
                          />
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
            </>
          </GestureHandlerRootView>
        </MenuProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
