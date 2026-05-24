import { useState } from "react";
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Spain", "Italy", "Japan", "Brazil", "Mexico", "India",
  "China", "South Korea", "Netherlands", "Sweden", "Norway", "Denmark",
  "Switzerland", "New Zealand", "Argentina", "Chile", "Colombia", "Other",
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Italian",
  "Japanese", "Korean", "Chinese (Simplified)", "Chinese (Traditional)",
  "Dutch", "Swedish", "Norwegian", "Danish", "Polish", "Russian",
  "Arabic", "Hindi", "Other",
];

export default function RegisterScreen() {
  const colors = useColors();
  const { dispatch } = useAppStore();
  const params = useLocalSearchParams<{ provider?: string; email?: string }>();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: params.email || "",
    phone: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    city: "",
    country: "",
    language: "English",
  });
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const { name, username, phone, dobDay, dobMonth, dobYear, city, country } = form;
    if (!name || !username || !phone || !dobDay || !dobMonth || !dobYear || !city || !country) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }
    if (username.length < 3) {
      Alert.alert("Invalid Username", "Username must be at least 3 characters.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsLoading(true);

    setTimeout(() => {
      const dob = `${form.dobYear}-${form.dobMonth.padStart(2, "0")}-${form.dobDay.padStart(2, "0")}`;
      dispatch({
        type: "SET_USER_PROFILE",
        profile: {
          id: `user_${Date.now()}`,
          name: form.name,
          username: form.username,
          email: form.email,
          phone: form.phone,
          dateOfBirth: dob,
          city: form.city,
          country: form.country,
          language: form.language,
          isGuest: false,
          createdAt: new Date().toISOString(),
          onboardingComplete: false,
        },
      });
      setIsLoading(false);
      router.replace("/(auth)/onboarding");
    }, 600);
  };

  const InputField = ({
    label, value, onChangeText, placeholder, keyboardType, secureTextEntry, required = true
  }: {
    label: string; value: string; onChangeText: (v: string) => void;
    placeholder?: string; keyboardType?: any; secureTextEntry?: boolean; required?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.foreground }]}>
        {label}{required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
        placeholder={placeholder || label}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
        secureTextEntry={secureTextEntry}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
        returnKeyType="next"
      />
    </View>
  );

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
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
            <Text style={[styles.title, { color: colors.foreground }]}>Create Your Account</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {params.provider ? `Signing in with ${params.provider}` : "Fill in your details to get started"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Personal Information</Text>

            <InputField label="Full Name" value={form.name} onChangeText={(v) => update("name", v)} placeholder="John Doe" />
            <InputField label="Username" value={form.username} onChangeText={(v) => update("username", v.toLowerCase().replace(/\s/g, ""))} placeholder="johndoe" />
            <InputField label="Email Address" value={form.email} onChangeText={(v) => update("email", v)} placeholder="you@example.com" keyboardType="email-address" required={false} />
            <InputField label="Phone Number" value={form.phone} onChangeText={(v) => update("phone", v)} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Date of Birth <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <View style={styles.dobRow}>
                <TextInput
                  style={[styles.dobInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="MM"
                  placeholderTextColor={colors.muted}
                  value={form.dobMonth}
                  onChangeText={(v) => update("dobMonth", v.replace(/\D/g, "").slice(0, 2))}
                  keyboardType="number-pad"
                  maxLength={2}
                  returnKeyType="next"
                />
                <Text style={[styles.dobSep, { color: colors.muted }]}>/</Text>
                <TextInput
                  style={[styles.dobInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="DD"
                  placeholderTextColor={colors.muted}
                  value={form.dobDay}
                  onChangeText={(v) => update("dobDay", v.replace(/\D/g, "").slice(0, 2))}
                  keyboardType="number-pad"
                  maxLength={2}
                  returnKeyType="next"
                />
                <Text style={[styles.dobSep, { color: colors.muted }]}>/</Text>
                <TextInput
                  style={[styles.dobInputYear, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="YYYY"
                  placeholderTextColor={colors.muted}
                  value={form.dobYear}
                  onChangeText={(v) => update("dobYear", v.replace(/\D/g, "").slice(0, 4))}
                  keyboardType="number-pad"
                  maxLength={4}
                  returnKeyType="next"
                />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 8 }]}>Location & Language</Text>

            <InputField label="City" value={form.city} onChangeText={(v) => update("city", v)} placeholder="New York" />

            {/* Country Picker */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Country <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <Pressable
                style={[styles.pickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowCountryPicker(!showCountryPicker)}
              >
                <Text style={[styles.pickerText, { color: form.country ? colors.foreground : colors.muted }]}>
                  {form.country || "Select Country"}
                </Text>
                <Text style={{ color: colors.muted }}>▼</Text>
              </Pressable>
              {showCountryPicker && (
                <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {COUNTRIES.map((c) => (
                      <Pressable
                        key={c}
                        style={[styles.dropdownItem, form.country === c && { backgroundColor: colors.primary + "20" }]}
                        onPress={() => { update("country", c); setShowCountryPicker(false); }}
                      >
                        <Text style={[styles.dropdownItemText, { color: colors.foreground }]}>{c}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Language Picker */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Language</Text>
              <Pressable
                style={[styles.pickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowLanguagePicker(!showLanguagePicker)}
              >
                <Text style={[styles.pickerText, { color: colors.foreground }]}>{form.language}</Text>
                <Text style={{ color: colors.muted }}>▼</Text>
              </Pressable>
              {showLanguagePicker && (
                <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {LANGUAGES.map((l) => (
                      <Pressable
                        key={l}
                        style={[styles.dropdownItem, form.language === l && { backgroundColor: colors.primary + "20" }]}
                        onPress={() => { update("language", l); setShowLanguagePicker(false); }}
                      >
                        <Text style={[styles.dropdownItemText, { color: colors.foreground }]}>{l}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Submit */}
          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              isLoading && { opacity: 0.6 },
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitText}>{isLoading ? "Creating Account..." : "Continue →"}</Text>
          </Pressable>

          <Text style={[styles.requiredNote, { color: colors.muted }]}>
            Fields marked with * are required
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48 },
  header: { marginTop: 16, marginBottom: 28 },
  backBtn: { marginBottom: 20, width: 40, height: 40, justifyContent: "center" },
  backIcon: { fontSize: 24, fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  form: { gap: 14, marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 4 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600" },
  input: {
    borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16,
  },
  dobRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dobInput: {
    flex: 1, borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 12, paddingVertical: 14, fontSize: 16, textAlign: "center",
  },
  dobInputYear: {
    flex: 2, borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 12, paddingVertical: 14, fontSize: 16, textAlign: "center",
  },
  dobSep: { fontSize: 20, fontWeight: "300" },
  pickerBtn: {
    borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  pickerText: { fontSize: 16 },
  dropdown: {
    borderRadius: 12, borderWidth: 1.5, marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownItemText: { fontSize: 15 },
  submitBtn: {
    borderRadius: 16, paddingVertical: 17, alignItems: "center",
    marginBottom: 12,
  },
  submitText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
  requiredNote: { fontSize: 12, textAlign: "center" },
});
