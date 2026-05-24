import { View, Text, Image, Pressable, StyleSheet, Dimensions } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAppStore } from "@/lib/store";
import { useColors } from "@/hooks/use-colors";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const colors = useColors();
  const { dispatch } = useAppStore();

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(auth)/login");
  };

  const handleGuest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch({ type: "SET_GUEST_MODE" });
    router.replace("/(tabs)");
  };

  return (
    <LinearGradient
      colors={["#4F46E5", "#6366F1", "#818CF8"]}
      style={styles.container}
    >
      {/* Background decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>BookScan</Text>
        <Text style={styles.subtitle}>Scan, Value & Sell Books</Text>
        <Text style={styles.description}>
          Discover the market value of any book instantly.{"\n"}
          Buy and sell with confidence.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        {[
          { icon: "📸", text: "Scan barcodes instantly" },
          { icon: "💰", text: "Get real market prices" },
          { icon: "🛒", text: "Buy & sell in-app" },
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* CTAs */}
      <View style={styles.ctaContainer}>
        <Pressable
          style={({ pressed }) => [styles.signInBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
          onPress={handleSignIn}
        >
          <Text style={styles.signInText}>Create Account / Sign In</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.guestBtn, pressed && { opacity: 0.7 }]}
          onPress={handleGuest}
        >
          <Text style={styles.guestText}>Continue as Guest</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 48,
  },
  circle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  circle1: {
    width: 300,
    height: 300,
    top: -80,
    right: -80,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -60,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 22,
  },
  featuresContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  ctaContainer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
    marginTop: "auto",
  },
  signInBtn: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  signInText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#4F46E5",
  },
  guestBtn: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
  },
  guestText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  disclaimer: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
  },
});
