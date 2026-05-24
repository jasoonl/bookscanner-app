import { useState } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";

export default function EditProfileScreen() {
  const colors = useColors();
  const { state, dispatch } = useAppStore();
  const profile = state.userProfile;

  const [form, setForm] = useState({
    name: profile?.name || "",
    username: profile?.username || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    city: profile?.city || "",
    country: profile?.country || "",
    language: profile?.language || "English",
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.name || !form.username || !form.phone) {
      Alert.alert("Missing Fields", "Name, username, and phone are required.");
      return;
    }
    dispatch({ type: "UPDATE_USER_PROFILE", updates: form });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Profile Updated!", "Your profile has been saved.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Edit Profile</Text>
          <Pressable
            style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.8 }]}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {[
            { key: "name", label: "Full Name", placeholder: "John Doe" },
            { key: "username", label: "Username", placeholder: "johndoe" },
            { key: "email", label: "Email", placeholder: "you@example.com", keyboard: "email-address" },
            { key: "phone", label: "Phone Number", placeholder: "+1 (555) 000-0000", keyboard: "phone-pad" },
            { key: "city", label: "City", placeholder: "New York" },
            { key: "country", label: "Country", placeholder: "United States" },
            { key: "language", label: "Language", placeholder: "English" },
          ].map((field) => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>{field.label}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder={field.placeholder}
                placeholderTextColor={colors.muted}
                value={form[field.key as keyof typeof form]}
                onChangeText={(v) => update(field.key as keyof typeof form, v)}
                keyboardType={(field.keyboard as any) || "default"}
                autoCapitalize={field.keyboard === "email-address" ? "none" : "words"}
                returnKeyType="next"
              />
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48, gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600" },
  input: {
    borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16,
  },
});
