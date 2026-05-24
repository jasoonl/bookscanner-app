import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemeProvider } from "@/lib/theme-provider";
import { AppProvider } from "@/lib/store";
import { useColorScheme } from "@/hooks/use-color-scheme";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({});

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  }, []);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
          <ThemeProvider>
            <NavThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
                <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
                <Stack.Screen name="book-detail" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
                <Stack.Screen name="sell-options" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
                <Stack.Screen name="create-listing" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
                <Stack.Screen name="payment-info" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
                <Stack.Screen name="listing-detail" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
                <Stack.Screen name="edit-profile" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
                <Stack.Screen name="oauth/callback" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </NavThemeProvider>
          </ThemeProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
