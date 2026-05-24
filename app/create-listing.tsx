import { useState } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, Alert, Image
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/bookService";
import { BOOK_CONDITIONS } from "@/shared/types";
import type { ScannedBook, BookListing, BookCondition } from "@/shared/types";

export default function CreateListingScreen() {
  const colors = useColors();
  const { dispatch, state } = useAppStore();
  const params = useLocalSearchParams<{ bookJson?: string; listingJson?: string }>();

  let initialBook: ScannedBook | null = null;
  let editListing: BookListing | null = null;

  if (params.bookJson) {
    try { initialBook = JSON.parse(params.bookJson); } catch {}
  }
  if (params.listingJson) {
    try { editListing = JSON.parse(params.listingJson); } catch {}
  }

  const book = initialBook || (editListing ? {
    isbn: editListing.isbn, title: editListing.title, author: editListing.author,
    coverUrl: editListing.coverUrl, id: "", scannedAt: "", prices: [], bestPrice: editListing.price,
  } as ScannedBook : null);

  const [price, setPrice] = useState(editListing?.price?.toString() || book?.bestPrice?.toFixed(2) || "");
  const [condition, setCondition] = useState<BookCondition>(editListing?.condition || "good");
  const [description, setDescription] = useState(editListing?.description || "");
  const [isLoading, setIsLoading] = useState(false);

  if (!book) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.muted }}>No book selected</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: colors.primary, marginTop: 12 }}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const handleSubmit = () => {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price greater than $0.");
      return;
    }
    if (!state.userProfile || state.isGuest) {
      Alert.alert("Sign In Required", "You need to sign in to create listings.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }

    setIsLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      const listing: BookListing = {
        id: editListing?.id || `listing_${Date.now()}`,
        userId: state.userProfile!.id,
        userName: state.userProfile!.name,
        userPhone: state.userProfile!.phone,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        price: priceNum,
        condition,
        description,
        status: "active",
        createdAt: editListing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        buyerInquiries: [],
      };

      if (editListing) {
        dispatch({ type: "UPDATE_LISTING", listing });
      } else {
        dispatch({ type: "ADD_LISTING", listing });
      }

      setIsLoading(false);
      Alert.alert(
        editListing ? "Listing Updated!" : "Listing Created!",
        editListing
          ? "Your listing has been updated."
          : `"${book.title}" is now live on the BookScan Marketplace!`,
        [{ text: "View Listings", onPress: () => router.replace("/(tabs)/my-listings") }]
      );
    }, 600);
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
            <IconSymbol name="xmark" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {editListing ? "Edit Listing" : "Create Listing"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Book Preview */}
          <View style={[styles.bookPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {book.coverUrl ? (
              <Image source={{ uri: book.coverUrl }} style={styles.cover} resizeMode="cover" />
            ) : (
              <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary + "15" }]}>
                <Text style={{ fontSize: 32 }}>📚</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.bookTitle, { color: colors.foreground }]} numberOfLines={2}>
                {book.title}
              </Text>
              <Text style={[styles.bookAuthor, { color: colors.muted }]}>by {book.author}</Text>
              {book.bestPrice && (
                <Text style={[styles.suggestedPrice, { color: colors.muted }]}>
                  Market value: {formatPrice(book.bestPrice)}
                </Text>
              )}
            </View>
          </View>

          {/* Price */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Asking Price</Text>
            <View style={[styles.priceInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.currencySymbol, { color: colors.foreground }]}>$</Text>
              <TextInput
                style={[styles.priceInput, { color: colors.foreground }]}
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
            {book.bestPrice && (
              <View style={styles.priceHints}>
                {[0.6, 0.8, 1.0].map((mult) => {
                  const suggested = (book.bestPrice! * mult).toFixed(2);
                  const label = mult === 0.6 ? "Quick Sale" : mult === 0.8 ? "Fair Price" : "Market Rate";
                  return (
                    <Pressable
                      key={mult}
                      style={[styles.priceHint, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => setPrice(suggested)}
                    >
                      <Text style={[styles.priceHintLabel, { color: colors.muted }]}>{label}</Text>
                      <Text style={[styles.priceHintValue, { color: colors.primary }]}>${suggested}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Condition */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Book Condition</Text>
            <View style={styles.conditionGrid}>
              {BOOK_CONDITIONS.map((c) => (
                <Pressable
                  key={c.value}
                  style={[
                    styles.conditionCard,
                    {
                      backgroundColor: condition === c.value ? colors.primary : colors.surface,
                      borderColor: condition === c.value ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => { setCondition(c.value); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <Text style={[styles.conditionLabel, { color: condition === c.value ? "#FFFFFF" : colors.foreground }]}>
                    {c.label}
                  </Text>
                  <Text style={[styles.conditionDesc, { color: condition === c.value ? "rgba(255,255,255,0.8)" : colors.muted }]}>
                    {c.description}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description (Optional)</Text>
            <TextInput
              style={[
                styles.descriptionInput,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground },
              ]}
              placeholder="Describe the book's condition, any notes or markings, edition, etc."
              placeholderTextColor={colors.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Payment reminder */}
          <View style={[styles.paymentReminder, { backgroundColor: colors.warning + "10", borderColor: colors.warning + "30" }]}>
            <Text style={[styles.paymentReminderTitle, { color: colors.warning }]}>💳 Payment Setup</Text>
            <Text style={[styles.paymentReminderText, { color: colors.muted }]}>
              Make sure your payment methods are set up in your Profile so buyers can pay you.
            </Text>
            <Pressable onPress={() => router.push("/payment-info")}>
              <Text style={[styles.paymentReminderLink, { color: colors.primary }]}>Set up payments →</Text>
            </Pressable>
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
            <Text style={styles.submitText}>
              {isLoading ? "Publishing..." : editListing ? "Update Listing" : "Publish Listing 🚀"}
            </Text>
          </Pressable>
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
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },
  bookPreview: {
    flexDirection: "row", gap: 14, padding: 14,
    borderRadius: 16, borderWidth: 1, marginTop: 20, marginBottom: 24,
  },
  cover: { width: 60, height: 85, borderRadius: 8 },
  coverPlaceholder: {
    width: 60, height: 85, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
  },
  bookTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20, marginBottom: 4 },
  bookAuthor: { fontSize: 13, marginBottom: 4 },
  suggestedPrice: { fontSize: 12 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  priceInputContainer: {
    flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1.5,
    paddingHorizontal: 16, paddingVertical: 4,
  },
  currencySymbol: { fontSize: 24, fontWeight: "700", marginRight: 4 },
  priceInput: { flex: 1, fontSize: 32, fontWeight: "800", paddingVertical: 12 },
  priceHints: { flexDirection: "row", gap: 8, marginTop: 12 },
  priceHint: {
    flex: 1, padding: 10, borderRadius: 12, borderWidth: 1, alignItems: "center",
  },
  priceHintLabel: { fontSize: 10, fontWeight: "600", marginBottom: 2 },
  priceHintValue: { fontSize: 14, fontWeight: "700" },
  conditionGrid: { gap: 8 },
  conditionCard: {
    padding: 14, borderRadius: 14, borderWidth: 1.5,
  },
  conditionLabel: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  conditionDesc: { fontSize: 12 },
  descriptionInput: {
    borderRadius: 14, borderWidth: 1.5, padding: 14,
    fontSize: 15, minHeight: 100, lineHeight: 22,
  },
  paymentReminder: {
    borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 24, gap: 6,
  },
  paymentReminderTitle: { fontSize: 14, fontWeight: "700" },
  paymentReminderText: { fontSize: 13, lineHeight: 18 },
  paymentReminderLink: { fontSize: 13, fontWeight: "600" },
  submitBtn: {
    borderRadius: 16, paddingVertical: 17, alignItems: "center",
  },
  submitText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
});
