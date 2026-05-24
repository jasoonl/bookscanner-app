import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/lib/store";
import { useColors } from "@/hooks/use-colors";

export default function RootIndex() {
  const { state } = useAppStore();
  const colors = useColors();

  useEffect(() => {
    // Small delay to let state load from AsyncStorage
    const timer = setTimeout(() => {
      if (state.userProfile || state.isGuest) {
        if (!state.onboardingComplete && !state.isGuest) {
          router.replace("/(auth)/onboarding");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        router.replace("/(auth)/welcome");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [state.userProfile, state.isGuest, state.onboardingComplete]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
