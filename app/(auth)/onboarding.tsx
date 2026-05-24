import { useState } from "react";
import {
  View, Text, Pressable, StyleSheet, ScrollView, Dimensions, Animated
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";
import { BOOK_GENRES } from "@/shared/types";

const { width } = Dimensions.get("window");

const HOW_FOUND_OPTIONS = [
  { id: "app_store", label: "App Store Search", icon: "🔍" },
  { id: "friend", label: "Friend / Family", icon: "👥" },
  { id: "social_media", label: "Social Media", icon: "📱" },
  { id: "google", label: "Google Search", icon: "🌐" },
  { id: "book_club", label: "Book Club", icon: "📚" },
  { id: "school", label: "School / University", icon: "🎓" },
  { id: "youtube", label: "YouTube", icon: "▶️" },
  { id: "other", label: "Other", icon: "✨" },
];

const WHY_USING_OPTIONS = [
  { id: "sell_books", label: "Sell my books", icon: "💰" },
  { id: "buy_books", label: "Buy books cheaply", icon: "🛒" },
  { id: "value_collection", label: "Value my collection", icon: "📊" },
  { id: "track_prices", label: "Track price changes", icon: "📈" },
  { id: "declutter", label: "Declutter my home", icon: "🏠" },
  { id: "resell_business", label: "Book reselling business", icon: "🏪" },
  { id: "curiosity", label: "Just curious", icon: "🤔" },
  { id: "gift_ideas", label: "Gift ideas", icon: "🎁" },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const { state, dispatch } = useAppStore();
  const [step, setStep] = useState(0);
  const [howFound, setHowFound] = useState<string>("");
  const [whyUsing, setWhyUsing] = useState<string>("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const steps = [
    { title: "How did you find us?", subtitle: "Help us understand how you discovered BookScan" },
    { title: "Why are you here?", subtitle: "Tell us what you're looking to do with BookScan" },
    { title: "What do you love reading?", subtitle: "Select your favorite genres (pick as many as you like)" },
  ];

  const toggleGenre = (genre: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleNext = () => {
    if (step === 0 && !howFound) return;
    if (step === 1 && !whyUsing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch({
      type: "UPDATE_USER_PROFILE",
      updates: {
        howFoundApp: howFound,
        whyUsingApp: whyUsing,
        favoriteGenres: selectedGenres,
        onboardingComplete: true,
      },
    });
    dispatch({ type: "SET_ONBOARDING_COMPLETE", complete: true });
    router.replace("/(tabs)");
  };

  const canProceed = step === 0 ? !!howFound : step === 1 ? !!whyUsing : true;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.progressBar}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor: i <= step ? colors.primary : colors.border,
                  width: i === step ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.stepText, { color: colors.muted }]}>Step {step + 1} of 3</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.emoji, {}]}>
            {step === 0 ? "🔍" : step === 1 ? "🎯" : "📚"}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>{steps[step].title}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{steps[step].subtitle}</Text>
        </View>

        {/* Step 0: How Found */}
        {step === 0 && (
          <View style={styles.optionsGrid}>
            {HOW_FOUND_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    backgroundColor: howFound === opt.id ? colors.primary : colors.surface,
                    borderColor: howFound === opt.id ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
                ]}
                onPress={() => { setHowFound(opt.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <Text style={styles.optionIcon}>{opt.icon}</Text>
                <Text style={[styles.optionLabel, { color: howFound === opt.id ? "#FFFFFF" : colors.foreground }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Step 1: Why Using */}
        {step === 1 && (
          <View style={styles.optionsGrid}>
            {WHY_USING_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    backgroundColor: whyUsing === opt.id ? colors.primary : colors.surface,
                    borderColor: whyUsing === opt.id ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
                ]}
                onPress={() => { setWhyUsing(opt.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <Text style={styles.optionIcon}>{opt.icon}</Text>
                <Text style={[styles.optionLabel, { color: whyUsing === opt.id ? "#FFFFFF" : colors.foreground }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Step 2: Genres */}
        {step === 2 && (
          <View style={styles.genresContainer}>
            {BOOK_GENRES.map((genre) => {
              const selected = selectedGenres.includes(genre);
              return (
                <Pressable
                  key={genre}
                  style={({ pressed }) => [
                    styles.genreChip,
                    {
                      backgroundColor: selected ? colors.primary : colors.surface,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => toggleGenre(genre)}
                >
                  <Text style={[styles.genreText, { color: selected ? "#FFFFFF" : colors.foreground }]}>
                    {genre}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {step === 2 && selectedGenres.length === 0 && (
          <Text style={[styles.skipHint, { color: colors.muted }]}>
            You can skip this step or select your favorites
          </Text>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: canProceed ? colors.primary : colors.border },
            pressed && canProceed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
          onPress={handleNext}
          disabled={!canProceed && step < 2}
        >
          <Text style={[styles.nextText, { color: canProceed ? "#FFFFFF" : colors.muted }]}>
            {step === 2 ? "Get Started 🚀" : "Continue →"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressContainer: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressBar: { flexDirection: "row", alignItems: "center", gap: 6 },
  progressDot: { height: 8, borderRadius: 4 },
  stepText: { fontSize: 13, fontWeight: "500" },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 },
  header: { alignItems: "center", paddingVertical: 28 },
  emoji: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 8, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  optionCard: {
    width: (width - 68) / 2,
    borderRadius: 16, borderWidth: 1.5,
    padding: 16, alignItems: "center", gap: 8,
  },
  optionIcon: { fontSize: 28 },
  optionLabel: { fontSize: 13, fontWeight: "600", textAlign: "center", lineHeight: 18 },
  genresContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  genreChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 24, borderWidth: 1.5,
  },
  genreText: { fontSize: 14, fontWeight: "600" },
  footer: {
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40,
    borderTopWidth: 1, gap: 8,
  },
  skipHint: { fontSize: 13, textAlign: "center" },
  nextBtn: {
    borderRadius: 16, paddingVertical: 17, alignItems: "center",
  },
  nextText: { fontSize: 17, fontWeight: "700" },
});
