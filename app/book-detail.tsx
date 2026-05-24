import { useState } from "react";
import {
  View, Text, ScrollView, Image, Pressable, StyleSheet,
  Dimensions, Alert
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/bookService";
import type { ScannedBook, BookPrice } from "@/shared/types";
import { BOOK_CONDITIONS } from "@/shared/types";

const { width } = Dimensions.get("window");

function PriceHistoryChart({ history }: { history: NonNullable<ScannedBook["priceHistory"]> }) {
  const colors = useColors();
  if (!history || history.length === 0) return null;

  const maxPrice = Math.max(...history.map((h) => h.highestPrice));
  const chartWidth = width - 48;
  const chartHeight = 120;

  return (
    <View style={[styles.chartContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.chartTitle, { color: colors.foreground }]}>Price History</Text>
      <View style={{ height: chartHeight, flexDirection: "row", alignItems: "flex-end", gap: 4, paddingTop: 8 }}>
        {history.map((point, i) => {
          const barHeight = (point.averagePrice / maxPrice) * (chartHeight - 20);
          const isLast = i === history.length - 1;
          return (
            <View key={point.year} style={{ flex: 1, alignItems: "center", gap: 4 }}>
              <View
                style={{
                  width: "100%",
                  height: barHeight,
                  backgroundColor: isLast ? colors.primary : colors.primary + "60",
                  borderRadius: 4,
                  minHeight: 4,
                }}
              />
              <Text style={{ fontSize: 9, color: colors.muted, textAlign: "center" }}>
                {point.year.toString().slice(2)}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.chartLegend}>
        <Text style={[styles.chartLegendText, { color: colors.muted }]}>
          Low: {formatPrice(Math.min(...history.map((h) => h.lowestPrice)))}
        </Text>
        <Text style={[styles.chartLegendText, { color: colors.primary }]}>
          Now: {formatPrice(history[history.length - 1]?.averagePrice || 0)}
        </Text>
        <Text style={[styles.chartLegendText, { color: colors.muted }]}>
          High: {formatPrice(maxPrice)}
        </Text>
      </View>
    </View>
  );
}

function PriceRow({ price }: { price: BookPrice }) {
  const colors = useColors();
  const conditionLabel = BOOK_CONDITIONS.find((c) => c.value === price.condition)?.label || price.condition;
  return (
    <View style={[styles.priceRow, { borderBottomColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.platformName, { color: colors.foreground }]}>{price.platform}</Text>
        <View style={[styles.conditionBadge, { backgroundColor: colors.primary + "15" }]}>
          <Text style={[styles.conditionText, { color: colors.primary }]}>{conditionLabel}</Text>
        </View>
      </View>
      <Text style={[styles.priceAmount, { color: "#10B981" }]}>{formatPrice(price.price)}</Text>
    </View>
  );
}

export default function BookDetailScreen() {
  const colors = useColors();
  const { state, dispatch } = useAppStore();
  const params = useLocalSearchParams<{ isbn?: string; bookJson?: string }>();
  const [showAllPrices, setShowAllPrices] = useState(false);

  let book: ScannedBook | null = null;
  if (params.bookJson) {
    try {
      book = JSON.parse(params.bookJson);
    } catch {}
  }
  if (!book && params.isbn) {
    book = state.scannedBooks.find((b) => b.isbn === params.isbn) || null;
  }

  if (!book) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.muted }]}>Book not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[{ color: colors.primary, marginTop: 12, fontWeight: "600" }]}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const isInMyBooks = state.scannedBooks.some((b) => b.isbn === book!.isbn);
  const displayedPrices = showAllPrices ? book.prices : book.prices.slice(0, 4);
  const bestPrice = book.bestPrice || (book.prices[0]?.price ?? 0);
  const highestPrice = book.prices.length > 0 ? Math.max(...book.prices.map((p) => p.price)) : 0;

  const handleAddToMyBooks = () => {
    if (isInMyBooks) {
      Alert.alert("Already Added", "This book is already in your collection.");
      return;
    }
    dispatch({ type: "ADD_SCANNED_BOOK", book: book! });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Added!", `"${book!.title}" has been added to My Books.`);
  };

  const handleSell = () => {
    router.push({
      pathname: "/sell-options",
      params: { isbn: book!.isbn, bookJson: JSON.stringify([book]) },
    });
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Book Details</Text>
        <Pressable
          style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.6 }]}
          onPress={() => {}}
        >
          <IconSymbol name="square.and.arrow.up" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero Section */}
        <View style={[styles.hero, { backgroundColor: colors.primary + "10" }]}>
          {book.coverUrl ? (
            <Image source={{ uri: book.coverUrl }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary + "20" }]}>
              <Text style={{ fontSize: 64 }}>📚</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Title & Author */}
          <Text style={[styles.title, { color: colors.foreground }]}>{book.title}</Text>
          <Text style={[styles.author, { color: colors.muted }]}>by {book.author}</Text>

          {/* Meta tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow}>
            {book.genre && (
              <View style={[styles.tag, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{book.genre}</Text>
              </View>
            )}
            {book.publishedYear && (
              <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                <Text style={[styles.tagText, { color: colors.muted }]}>{book.publishedYear}</Text>
              </View>
            )}
            {book.pageCount && (
              <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                <Text style={[styles.tagText, { color: colors.muted }]}>{book.pageCount} pages</Text>
              </View>
            )}
            {book.publisher && (
              <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                <Text style={[styles.tagText, { color: colors.muted }]}>{book.publisher}</Text>
              </View>
            )}
            <View style={[styles.tag, { backgroundColor: colors.surface }]}>
              <Text style={[styles.tagText, { color: colors.muted }]}>ISBN: {book.isbn}</Text>
            </View>
          </ScrollView>

          {/* Price Summary */}
          <View style={[styles.priceSummary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.priceItem}>
              <Text style={[styles.priceItemLabel, { color: colors.muted }]}>Best Price</Text>
              <Text style={[styles.priceItemValue, { color: "#10B981" }]}>{formatPrice(bestPrice)}</Text>
            </View>
            <View style={[styles.priceDivider, { backgroundColor: colors.border }]} />
            <View style={styles.priceItem}>
              <Text style={[styles.priceItemLabel, { color: colors.muted }]}>Highest</Text>
              <Text style={[styles.priceItemValue, { color: colors.warning }]}>{formatPrice(highestPrice)}</Text>
            </View>
            <View style={[styles.priceDivider, { backgroundColor: colors.border }]} />
            <View style={styles.priceItem}>
              <Text style={[styles.priceItemLabel, { color: colors.muted }]}>Platforms</Text>
              <Text style={[styles.priceItemValue, { color: colors.primary }]}>{book.prices.length}</Text>
            </View>
          </View>

          {/* Price History Chart */}
          {book.priceHistory && book.priceHistory.length > 0 && (
            <PriceHistoryChart history={book.priceHistory} />
          )}

          {/* Description */}
          {book.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About This Book</Text>
              <Text style={[styles.description, { color: colors.muted }]}>{book.description}</Text>
            </View>
          )}

          {/* Prices by Platform */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Prices by Platform</Text>
            <View style={[styles.pricesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {displayedPrices.map((price, i) => (
                <PriceRow key={`${price.platform}-${i}`} price={price} />
              ))}
            </View>
            {book.prices.length > 4 && (
              <Pressable
                style={styles.showMoreBtn}
                onPress={() => setShowAllPrices(!showAllPrices)}
              >
                <Text style={[styles.showMoreText, { color: colors.primary }]}>
                  {showAllPrices ? "Show Less" : `Show ${book.prices.length - 4} More Platforms`}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {!isInMyBooks && (
          <Pressable
            style={({ pressed }) => [
              styles.bottomBtn,
              styles.bottomBtnSecondary,
              { borderColor: colors.primary },
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleAddToMyBooks}
          >
            <Text style={[styles.bottomBtnText, { color: colors.primary }]}>+ My Books</Text>
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.bottomBtn,
            { backgroundColor: "#F59E0B", flex: isInMyBooks ? 1 : undefined },
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
          onPress={handleSell}
        >
          <Text style={[styles.bottomBtnText, { color: "#FFFFFF" }]}>💰 Sell This Book</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5,
  },
  backBtn: { padding: 8 },
  shareBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  scroll: { paddingBottom: 100 },
  hero: { alignItems: "center", paddingVertical: 32 },
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
  tagsRow: { marginBottom: 20 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
  tagText: { fontSize: 12, fontWeight: "600" },
  priceSummary: {
    flexDirection: "row", borderRadius: 16, borderWidth: 1,
    overflow: "hidden", marginBottom: 20,
  },
  priceItem: { flex: 1, alignItems: "center", paddingVertical: 16 },
  priceItemLabel: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
  priceItemValue: { fontSize: 18, fontWeight: "800" },
  priceDivider: { width: 1 },
  chartContainer: {
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20,
  },
  chartTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  chartLegend: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  chartLegendText: { fontSize: 11, fontWeight: "600" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  description: { fontSize: 14, lineHeight: 22 },
  pricesCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  priceRow: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 0.5,
  },
  platformName: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  conditionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-start" },
  conditionText: { fontSize: 11, fontWeight: "600" },
  priceAmount: { fontSize: 17, fontWeight: "800" },
  showMoreBtn: { alignItems: "center", paddingVertical: 12 },
  showMoreText: { fontSize: 14, fontWeight: "600" },
  bottomActions: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", gap: 12, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 40, borderTopWidth: 0.5,
  },
  bottomBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 14, alignItems: "center",
  },
  bottomBtnSecondary: { borderWidth: 2 },
  bottomBtnText: { fontSize: 15, fontWeight: "700" },
});
