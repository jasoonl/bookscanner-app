import { useState } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet, Image, Alert,
  TextInput, KeyboardAvoidingView, Platform
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/bookService";
import { BOOK_CONDITIONS } from "@/shared/types";
import type { BookListing } from "@/shared/types";

const CONDITION_COLORS: Record<string, string> = {
  new: "#10B981", like_new: "#34D399", very_good: "#6366F1",
  good: "#F59E0B", acceptable: "#EF4444",
};

export default function ListingDetailScreen() {
  const colors = useColors();
  const { state, dispatch } = useAppStore();
  const params = useLocalSearchParams<{ listingJson?: string }>();
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  let listing: BookListing | null = null;
  if (params.listingJson) {
    try { listing = JSON.parse(params.listingJson); } catch {}
  }

  if (!listing) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.muted }}>Listing not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: colors.primary, marginTop: 12 }}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const conditionLabel = BOOK_CONDITIONS.find((c) => c.value === listing.condition)?.label || listing.condition;
  const conditionColor = CONDITION_COLORS[listing.condition] || colors.muted;
  const isOwnListing = state.userProfile?.id === listing.userId;

  const handleContactSeller = () => {
    if (!state.userProfile || state.isGuest) {
      Alert.alert("Sign In Required", "Sign in to contact sellers.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }
    setShowContactForm(true);
  };

  const handleSendInquiry = () => {
    if (!message.trim()) {
      Alert.alert("Empty Message", "Please write a message to the seller.");
      return;
    }
    setIsSending(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      // Add notification to the seller's listing
      const notification = {
        id: `notif_${Date.now()}`,
        listingId: listing!.id,
        buyerName: state.userProfile!.name,
        buyerPhone: state.userProfile!.phone,
        message: message.trim(),
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_NOTIFICATION", notification });
      setIsSending(false);
      setShowContactForm(false);
      setMessage("");
      Alert.alert(
        "Message Sent! 📨",
        `Your inquiry has been sent to ${listing!.userName}. They will contact you at ${state.userProfile!.phone}.`
      );
    }, 800);
  };

  const handleBuyNow = () => {
    if (!state.userProfile || state.isGuest) {
      Alert.alert("Sign In Required", "Sign in to purchase books.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }
    router.push({ pathname: "/payment-info", params: { mode: "buyer", listingJson: JSON.stringify(listing) } });
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Book Listing</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Cover */}
          <View style={[styles.coverSection, { backgroundColor: colors.primary + "08" }]}>
            {listing.coverUrl ? (
              <Image source={{ uri: listing.coverUrl }} style={styles.coverImage} resizeMode="cover" />
            ) : (
              <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary + "20" }]}>
                <Text style={{ fontSize: 64 }}>📚</Text>
              </View>
            )}
          </View>

          <View style={styles.content}>
            {/* Title & Price */}
            <Text style={[styles.title, { color: colors.foreground }]}>{listing.title}</Text>
            <Text style={[styles.author, { color: colors.muted }]}>by {listing.author}</Text>

            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: "#10B981" }]}>{formatPrice(listing.price)}</Text>
              <View style={[styles.conditionBadge, { backgroundColor: conditionColor + "20" }]}>
                <Text style={[styles.conditionText, { color: conditionColor }]}>{conditionLabel}</Text>
              </View>
            </View>

            {/* Seller Info */}
            <View style={[styles.sellerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.sellerAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.sellerAvatarText}>
                  {listing.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sellerName, { color: colors.foreground }]}>{listing.userName}</Text>
                <Text style={[styles.sellerLabel, { color: colors.muted }]}>Seller</Text>
              </View>
              <View style={[styles.verifiedBadge, { backgroundColor: "#10B981" + "15" }]}>
                <Text style={[styles.verifiedText, { color: "#10B981" }]}>✓ Verified</Text>
              </View>
            </View>

            {/* Description */}
            {listing.description && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Seller Notes</Text>
                <Text style={[styles.description, { color: colors.muted }]}>{listing.description}</Text>
              </View>
            )}

            {/* Listing Details */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Listing Details</Text>
              <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {[
                  { label: "ISBN", value: listing.isbn },
                  { label: "Condition", value: conditionLabel },
                  { label: "Listed", value: new Date(listing.createdAt).toLocaleDateString() },
                  { label: "Status", value: listing.status.charAt(0).toUpperCase() + listing.status.slice(1) },
                ].map((item, i) => (
                  <View key={item.label} style={[styles.detailRow, i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.border }]}>
                    <Text style={[styles.detailLabel, { color: colors.muted }]}>{item.label}</Text>
                    <Text style={[styles.detailValue, { color: colors.foreground }]}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Contact Form */}
            {showContactForm && !isOwnListing && (
              <View style={[styles.contactForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.contactFormTitle, { color: colors.foreground }]}>
                  Send a Message to {listing.userName}
                </Text>
                <TextInput
                  style={[styles.messageInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                  placeholder={`Hi ${listing.userName}, I'm interested in buying "${listing.title}"...`}
                  placeholderTextColor={colors.muted}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <Text style={[styles.contactNote, { color: colors.muted }]}>
                  The seller will contact you at your registered phone number.
                </Text>
                <View style={styles.contactFormActions}>
                  <Pressable
                    style={[styles.cancelBtn, { borderColor: colors.border }]}
                    onPress={() => { setShowContactForm(false); setMessage(""); }}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.muted }]}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.sendBtn, { backgroundColor: colors.primary }, isSending && { opacity: 0.6 }]}
                    onPress={handleSendInquiry}
                    disabled={isSending}
                  >
                    <Text style={styles.sendBtnText}>{isSending ? "Sending..." : "Send Message"}</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        {!isOwnListing && (
          <View style={[styles.bottomActions, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            {!showContactForm && (
              <Pressable
                style={({ pressed }) => [
                  styles.contactBtn,
                  { borderColor: colors.primary },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={handleContactSeller}
              >
                <Text style={[styles.contactBtnText, { color: colors.primary }]}>💬 Contact Seller</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.buyBtn,
                { backgroundColor: "#10B981" },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
              onPress={handleBuyNow}
            >
              <Text style={styles.buyBtnText}>Buy Now — {formatPrice(listing.price)}</Text>
            </Pressable>
          </View>
        )}
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
  scroll: { paddingBottom: 120 },
  coverSection: { alignItems: "center", paddingVertical: 32 },
  coverImage: {
    width: 140, height: 200, borderRadius: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 10,
  },
  coverPlaceholder: {
    width: 140, height: 200, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: -0.3, marginBottom: 6, lineHeight: 30 },
  author: { fontSize: 16, marginBottom: 16 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  price: { fontSize: 32, fontWeight: "800" },
  conditionBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  conditionText: { fontSize: 13, fontWeight: "700" },
  sellerCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 20,
  },
  sellerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
  },
  sellerAvatarText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  sellerName: { fontSize: 15, fontWeight: "700" },
  sellerLabel: { fontSize: 12, marginTop: 2 },
  verifiedBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  verifiedText: { fontSize: 12, fontWeight: "700" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 22 },
  detailsCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: "600" },
  contactForm: {
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20, gap: 12,
  },
  contactFormTitle: { fontSize: 15, fontWeight: "700" },
  messageInput: {
    borderRadius: 12, borderWidth: 1, padding: 12,
    fontSize: 14, minHeight: 80, lineHeight: 20,
  },
  contactNote: { fontSize: 12, lineHeight: 18 },
  contactFormActions: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  cancelBtnText: { fontSize: 14, fontWeight: "600" },
  sendBtn: { flex: 2, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  sendBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  bottomActions: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", gap: 12, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 40, borderTopWidth: 0.5,
  },
  contactBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 14, alignItems: "center", borderWidth: 2,
  },
  contactBtnText: { fontSize: 15, fontWeight: "700" },
  buyBtn: {
    flex: 2, paddingVertical: 15, borderRadius: 14, alignItems: "center",
  },
  buyBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
