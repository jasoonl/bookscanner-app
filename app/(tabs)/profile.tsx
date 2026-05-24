import { useState } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet, Image, Alert
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/bookService";

function MenuRow({ icon, label, value, onPress, danger = false }: {
  icon: string; label: string; value?: string; onPress: () => void; danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuRow,
        { borderBottomColor: colors.border },
        pressed && { backgroundColor: colors.surface },
      ]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <Text style={[styles.menuLabel, { color: danger ? colors.error : colors.foreground }]}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {value && <Text style={[styles.menuValue, { color: colors.muted }]}>{value}</Text>}
        <IconSymbol name="chevron.right" size={16} color={colors.muted} />
      </View>
    </Pressable>
  );
}

export default function ProfileTab() {
  const colors = useColors();
  const { state, dispatch } = useAppStore();
  const profile = state.userProfile;
  const isGuest = state.isGuest;

  const totalBooksValue = state.scannedBooks.reduce((sum, b) => sum + (b.bestPrice || 0), 0);
  const activeListings = state.listings.filter((l) => l.status === "active").length;

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            dispatch({ type: "SIGN_OUT" });
            router.replace("/(auth)/welcome");
          },
        },
      ]
    );
  };

  if (isGuest || !profile) {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Guest Header */}
          <View style={[styles.guestHeader, { backgroundColor: colors.primary + "10" }]}>
            <View style={[styles.guestAvatar, { backgroundColor: colors.primary + "30" }]}>
              <Text style={{ fontSize: 40 }}>👤</Text>
            </View>
            <Text style={[styles.guestTitle, { color: colors.foreground }]}>Guest User</Text>
            <Text style={[styles.guestSubtitle, { color: colors.muted }]}>
              Sign in to unlock all features including selling, listings, and price tracking.
            </Text>
            <View style={styles.guestBtns}>
              <Pressable
                style={[styles.signInBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(auth)/login")}
              >
                <Text style={styles.signInBtnText}>Sign In</Text>
              </Pressable>
              <Pressable
                style={[styles.registerBtn, { borderColor: colors.primary }]}
                onPress={() => router.push("/(auth)/register")}
              >
                <Text style={[styles.registerBtnText, { color: colors.primary }]}>Create Account</Text>
              </Pressable>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{state.scannedBooks.length}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Books Scanned</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: "#10B981" }]}>{formatPrice(totalBooksValue)}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Est. Value</Text>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.primary + "10" }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.profileName, { color: colors.foreground }]}>{profile.name}</Text>
          <Text style={[styles.profileUsername, { color: colors.muted }]}>@{profile.username}</Text>
          {profile.city && profile.country && (
            <Text style={[styles.profileLocation, { color: colors.muted }]}>
              📍 {profile.city}, {profile.country}
            </Text>
          )}
          <Pressable
            style={[styles.editProfileBtn, { borderColor: colors.primary }]}
            onPress={() => router.push("/edit-profile")}
          >
            <Text style={[styles.editProfileText, { color: colors.primary }]}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{state.scannedBooks.length}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Scanned</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: "#10B981" }]}>{formatPrice(totalBooksValue)}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Collection Value</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: "#F59E0B" }]}>{activeListings}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Active Listings</Text>
          </View>
        </View>

        {/* Genres */}
        {profile.favoriteGenres && profile.favoriteGenres.length > 0 && (
          <View style={styles.genresSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Favorite Genres</Text>
            <View style={styles.genresRow}>
              {profile.favoriteGenres.slice(0, 6).map((genre) => (
                <View key={genre} style={[styles.genreChip, { backgroundColor: colors.primary + "15" }]}>
                  <Text style={[styles.genreText, { color: colors.primary }]}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={[styles.menuSectionTitle, { color: colors.muted }]}>Account</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MenuRow icon="👤" label="Personal Information" onPress={() => router.push("/edit-profile")} />
            <MenuRow icon="💳" label="Payment Methods" onPress={() => router.push("/payment-info")} />
            <MenuRow icon="🔔" label="Notifications" onPress={() => router.push("/(tabs)/my-listings")} value={state.unreadNotificationCount > 0 ? `${state.unreadNotificationCount} new` : undefined} />
            <MenuRow icon="🌍" label="Language" value={profile.language || "English"} onPress={() => {}} />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={[styles.menuSectionTitle, { color: colors.muted }]}>Books & Selling</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MenuRow icon="📚" label="My Books" value={`${state.scannedBooks.length} books`} onPress={() => router.push("/(tabs)/my-books")} />
            <MenuRow icon="🏪" label="My Listings" value={`${state.listings.length} listings`} onPress={() => router.push("/(tabs)/my-listings")} />
            <MenuRow icon="📊" label="Selling History" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={[styles.menuSectionTitle, { color: colors.muted }]}>Support</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MenuRow icon="❓" label="Help & FAQ" onPress={() => {}} />
            <MenuRow icon="📧" label="Contact Support" onPress={() => {}} />
            <MenuRow icon="⭐" label="Rate BookScan" onPress={() => {}} />
            <MenuRow icon="📋" label="Privacy Policy" onPress={() => {}} />
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.menuSection}>
          <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MenuRow icon="🚪" label="Sign Out" onPress={handleSignOut} danger />
          </View>
        </View>

        {/* App Version */}
        <Text style={[styles.version, { color: colors.muted }]}>BookScan v1.0.0</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  guestHeader: {
    alignItems: "center", paddingVertical: 40, paddingHorizontal: 32, gap: 8,
  },
  guestAvatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: "center", alignItems: "center", marginBottom: 8,
  },
  guestTitle: { fontSize: 22, fontWeight: "700" },
  guestSubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  guestBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  signInBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  signInBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  registerBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, borderWidth: 2 },
  registerBtnText: { fontSize: 15, fontWeight: "700" },
  profileHeader: {
    alignItems: "center", paddingVertical: 32, paddingHorizontal: 24, gap: 6,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: "center", alignItems: "center", marginBottom: 8,
  },
  avatarText: { color: "#FFFFFF", fontSize: 32, fontWeight: "800" },
  profileName: { fontSize: 22, fontWeight: "800" },
  profileUsername: { fontSize: 15 },
  profileLocation: { fontSize: 13, marginTop: 2 },
  editProfileBtn: {
    marginTop: 12, paddingHorizontal: 24, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
  },
  editProfileText: { fontSize: 14, fontWeight: "600" },
  statsRow: {
    flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 16,
  },
  statCard: {
    flex: 1, alignItems: "center", padding: 14,
    borderRadius: 16, borderWidth: 1,
  },
  statValue: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: "500", textAlign: "center" },
  genresSection: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  genresRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genreChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  genreText: { fontSize: 13, fontWeight: "600" },
  menuSection: { paddingHorizontal: 16, marginBottom: 16 },
  menuSectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  menuCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  menuRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuIcon: { fontSize: 20 },
  menuLabel: { fontSize: 15, fontWeight: "500" },
  menuRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  menuValue: { fontSize: 13 },
  version: { textAlign: "center", fontSize: 12, paddingBottom: 20 },
});
