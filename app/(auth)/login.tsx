import { useState } from "react";
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";

type LoginMode = "options" | "email";

export default function LoginScreen() {
  const colors = useColors();
  const { dispatch } = useAppStore();
  const [mode, setMode] = useState<LoginMode>("options");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = (provider: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // For demo: simulate login and go to register to complete profile
    Alert.alert(
      `Sign in with ${provider}`,
      `${provider} sign-in would open here. For now, let's complete your profile.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => router.push({ pathname: "/(auth)/register", params: { provider } }),
        },
      ]
    );
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Info", "Please enter your email and password.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    // Simulate auth
    setTimeout(() => {
      setIsLoading(false);
      router.push({ pathname: "/(auth)/register", params: { provider: "email", email } });
    }, 800);
  };

  const providers = [
    { id: "Google", icon: "🌐", color: "#EA4335", bg: "#FEF2F2" },
    { id: "Apple", icon: "🍎", color: "#000000", bg: "#F9FAFB" },
    { id: "Microsoft", icon: "🪟", color: "#00A4EF", bg: "#EFF6FF" },
  ];

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.backIcon, { color: colors.primary }]}>←</Text>
            </Pressable>
            <View style={styles.headerTitle}>
              <Text style={[styles.title, { color: colors.foreground }]}>Welcome Back</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                Sign in to access your books and listings
              </Text>
            </View>
          </View>

          {mode === "options" ? (
            <>
              {/* Social Providers */}
              <View style={styles.providersContainer}>
                {providers.map((p) => (
                  <Pressable
                    key={p.id}
                    style={({ pressed }) => [
                      styles.providerBtn,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
                    ]}
                    onPress={() => handleSocialLogin(p.id)}
                  >
                    <Text style={styles.providerIcon}>{p.icon}</Text>
                    <Text style={[styles.providerText, { color: colors.foreground }]}>
                      Continue with {p.id}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.muted }]}>or</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              {/* Email option */}
              <Pressable
                style={({ pressed }) => [
                  styles.emailBtn,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => setMode("email")}
              >
                <Text style={styles.emailBtnText}>Continue with Email</Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* Email Form */}
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.foreground }]}>Email Address</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.muted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={handleEmailLogin}
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.submitBtn,
                    { backgroundColor: colors.primary },
                    pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                    isLoading && { opacity: 0.6 },
                  ]}
                  onPress={handleEmailLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.submitText}>{isLoading ? "Signing in..." : "Sign In"}</Text>
                </Pressable>

                <Pressable onPress={() => setMode("options")} style={styles.backToOptions}>
                  <Text style={[styles.backToOptionsText, { color: colors.primary }]}>
                    ← Other sign-in options
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {/* New user link */}
          <View style={styles.newUserRow}>
            <Text style={[styles.newUserText, { color: colors.muted }]}>New to BookScan? </Text>
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text style={[styles.newUserLink, { color: colors.primary }]}>Create Account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 16,
    marginBottom: 36,
  },
  backBtn: {
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 24,
    fontWeight: "600",
  },
  headerTitle: {},
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  providersContainer: {
    gap: 12,
    marginBottom: 24,
  },
  providerBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 14,
  },
  providerIcon: {
    fontSize: 22,
  },
  providerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emailBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  emailBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  submitText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  backToOptions: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backToOptionsText: {
    fontSize: 15,
    fontWeight: "500",
  },
  newUserRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    paddingTop: 16,
  },
  newUserText: {
    fontSize: 15,
  },
  newUserLink: {
    fontSize: 15,
    fontWeight: "700",
  },
});
