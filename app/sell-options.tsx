import { useState, useMemo } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet, Image, Alert, Linking
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/bookService";
import { SELL_PLATFORMS } from "@/shared/types";
import type { ScannedBook } from "@/shared/types";

export default function SellOptionsScreen() {
  const colors = useColors();
  const { dispatch, state } = useAppStore();
  const params = useLocalSearchParams<{ bookJson?: string; isbn?: string }>();

  let books: ScannedBook[] = [];
  if (params.bookJson) {
    try { books = JSON.parse(params.bookJson); } catch {}
  } else if (params.isbn) {
    const found = state.scannedBooks.find((b) => b.isbn === params.isbn);
    if (found) books = [found];
  }

  const totalValue = books.reduce((sum, b) => sum + (b.bestPrice || 0), 0);
  const highestValue = books.reduce((sum, b) => {
    const high = b.prices.length > 0 ? Math.max(...b.prices.map((p) => p.price)) : 0;
    return sum + high;
  }, 0);

  const handlePlatformPress = (platformId: string, platformName: string, url: string) => {
    if (platformId === "bookscan_marketplace") {
      // Navigate to create listing
      if (books.length === 1) {
        router.push({
          pathname: "/create-listing",
          params: { bookJson: JSON.stringify(books[0]) },
        });
      } else {
        Alert.alert(
          "Create Listings",
          `Create ${books.length} listings on BookScan Marketplace?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Create All",
              onPress: () => {
                router.push({
                  pathname: "/create-listing",
                  params: { bookJson: JSON.stringify(books[0]), multipleCount: books.length.toString() },
                });
              },
            },
          ]
        );
      }
    } else {
      // Open external platform
      const isbn = books[0]?.isbn || "";
      const searchUrl = url || `https://www.google.com/search?q=sell+book+isbn+${isbn}`;
      Linking.openURL(searchUrl).catch(() => {
        Alert.alert("Cannot Open", `Could not open ${platformName}. Please visit their website directly.`);
      });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Sell Options</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Value Summary */}
        <View style={[styles.valueSummary, { backgroundColor: "#10B981" + "12", borderColor: "#10B981" + "30" }]}>
          <Text style={[styles.valueLabel, { color: "#10B981" }]}>
            {books.length} book{books.length !== 1 ? "s" : ""} selected
          </Text>
          <View style={styles.valueRow}>
            <View style={styles.valueItem}>
              <Text style={[styles.valueItemLabel, { color: "#10B981" }]}>Best Sell Price</Text>
              <Text style={[styles.valueAmount, { color: "#10B981" }]}>{formatPrice(totalValue)}</Text>
            </View>
            <View style={[styles.valueDivider, { backgroundColor: "#10B981" + "30" }]} />
            <View style={styles.valueItem}>
              <Text style={[styles.valueItemLabel, { color: colors.warning }]}>Highest Possible</Text>
              <Text style={[styles.valueAmount, { color: colors.warning }]}>{formatPrice(highestValue)}</Text>
            </View>
          </View>
        </View>

        {/* Selected Books */}
        {books.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Books to Sell</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.booksRow}>
              {books.map((book) => (
                <View key={book.isbn} style={[styles.bookChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {book.coverUrl ? (
                    <Image source={{ uri: book.coverUrl }} style={styles.bookChipCover} resizeMode="cover" />
                  ) : (
                    <View style={[styles.bookChipCover, { backgroundColor: colors.primary + "15", justifyContent: "center", alignItems: "center" }]}>
                      <Text>📚</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bookChipTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={[styles.bookChipPrice, { color: "#10B981" }]}>
                      {formatPrice(book.bestPrice || 0)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Platforms */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Where to Sell</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
            Choose a platform to list your books
          </Text>

          {SELL_PLATFORMS.map((platform) => (
            <Pressable
              key={platform.id}
              style={({ pressed }) => [
                styles.platformCard,
                {
                  backgroundColor: platform.id === "bookscan_marketplace" ? colors.primary + "08" : colors.surface,
                  borderColor: platform.id === "bookscan_marketplace" ? colors.primary : colors.border,
                },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => handlePlatformPress(platform.id, platform.name, platform.url)}
            >
              <View style={styles.platformLeft}>
                <View style={[styles.platformIcon, { backgroundColor: platform.id === "bookscan_marketplace" ? colors.primary : colors.primary + "15" }]}>
                  <Text style={{ fontSize: 20 }}>
                    {platform.id === "bookscan_marketplace" ? "🏪" :
                     platform.id === "amazon" ? "📦" :
                     platform.id === "ebay" ? "🔨" :
                     platform.id === "abebooks" ? "📖" :
                     platform.id === "thriftbooks" ? "♻️" :
                     platform.id === "alibris" ? "🌐" :
                     platform.id === "bookfinder" ? "🔍" : "💰"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.platformNameRow}>
                    <Text style={[styles.platformName, { color: colors.foreground }]}>{platform.name}</Text>
                    {platform.id === "bookscan_marketplace" && (
                      <View style={[styles.recommendedBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.platformDesc, { color: colors.muted }]}>{platform.description}</Text>
                  <Text style={[styles.platformFee, { color: platform.averageFeePercent === 0 ? "#10B981" : colors.warning }]}>
                    {platform.averageFeePercent === 0 ? "Free to list" : `~${platform.averageFeePercent}% fee`}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: colors.primary + "08", borderColor: colors.primary + "20" }]}>
          <Text style={[styles.tipsTitle, { color: colors.primary }]}>💡 Selling Tips</Text>
          <Text style={[styles.tipsText, { color: colors.muted }]}>
            • Clean books sell for 20-30% more{"\n"}
            • Include clear photos of the cover and spine{"\n"}
            • Textbooks sell best at the start of semesters{"\n"}
            • Bundle similar books for better deals{"\n"}
            • BookScan Marketplace has the lowest fees
          </Text>
        </View>
      </ScrollView>
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
  scroll: { paddingBottom: 40 },
  valueSummary: {
    margin: 20, borderRadius: 20, borderWidth: 1, padding: 20,
  },
  valueLabel: { fontSize: 13, fontWeight: "600", marginBottom: 12, textAlign: "center" },
  valueRow: { flexDirection: "row" },
  valueItem: { flex: 1, alignItems: "center" },
  valueItemLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  valueAmount: { fontSize: 24, fontWeight: "800" },
  valueDivider: { width: 1, marginHorizontal: 16 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, marginBottom: 16 },
  booksRow: { marginBottom: 8 },
  bookChip: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 10, borderRadius: 14, borderWidth: 1, marginRight: 10, width: 200,
  },
  bookChipCover: { width: 40, height: 55, borderRadius: 6 },
  bookChipTitle: { fontSize: 13, fontWeight: "600" },
  bookChipPrice: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  platformCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 16, borderRadius: 16, borderWidth: 1.5, marginBottom: 10,
  },
  platformLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  platformIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
  },
  platformNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  platformName: { fontSize: 16, fontWeight: "700" },
  recommendedBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  recommendedText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  platformDesc: { fontSize: 12, lineHeight: 18, marginBottom: 4 },
  platformFee: { fontSize: 12, fontWeight: "600" },
  tipsCard: {
    marginHorizontal: 20, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20,
  },
  tipsTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  tipsText: { fontSize: 13, lineHeight: 22 },
});
