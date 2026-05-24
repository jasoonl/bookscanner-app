import { useState } from "react";
import {
  View, Text, FlatList, Pressable, StyleSheet, Image,
  Alert, TextInput
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/bookService";
import type { ScannedBook } from "@/shared/types";

export default function MyBooksTab() {
  const colors = useColors();
  const { state, dispatch } = useAppStore();
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "price" | "title">("date");

  const filteredBooks = state.scannedBooks
    .filter((b) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "price") return (b.bestPrice || 0) - (a.bestPrice || 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
    });

  const selectedBooks = state.scannedBooks.filter((b) => b.isSelected);
  const totalSelectedValue = selectedBooks.reduce((sum, b) => sum + (b.bestPrice || 0), 0);

  const handleToggleSelect = (isbn: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch({ type: "TOGGLE_BOOK_SELECTED", isbn });
  };

  const handleDeleteBook = (book: ScannedBook) => {
    Alert.alert(
      "Remove Book",
      `Remove "${book.title}" from your collection?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            dispatch({ type: "REMOVE_SCANNED_BOOK", isbn: book.isbn });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const handleSellSelected = () => {
    if (selectedBooks.length === 0) return;
    router.push({
      pathname: "/sell-options",
      params: {
        bookJson: JSON.stringify(selectedBooks),
        selectedOnly: "true",
      },
    });
  };

  const handleExitSelectMode = () => {
    setIsSelectMode(false);
    dispatch({ type: "CLEAR_BOOK_SELECTIONS" });
  };

  const renderBook = ({ item }: { item: ScannedBook }) => {
    const scannedDate = new Date(item.scannedAt).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

    return (
      <Pressable
        style={({ pressed }) => [
          styles.bookCard,
          { backgroundColor: colors.surface, borderColor: item.isSelected ? colors.primary : colors.border },
          item.isSelected && { borderWidth: 2 },
          pressed && { opacity: 0.85 },
        ]}
        onPress={() => {
          if (isSelectMode) {
            handleToggleSelect(item.isbn);
          } else {
            router.push({ pathname: "/book-detail", params: { isbn: item.isbn, bookJson: JSON.stringify(item) } });
          }
        }}
        onLongPress={() => {
          if (!isSelectMode) {
            setIsSelectMode(true);
            handleToggleSelect(item.isbn);
          }
        }}
      >
        {/* Selection checkbox */}
        {isSelectMode && (
          <View style={[styles.checkbox, { borderColor: item.isSelected ? colors.primary : colors.border, backgroundColor: item.isSelected ? colors.primary : "transparent" }]}>
            {item.isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        )}

        {/* Cover */}
        {item.coverUrl ? (
          <Image source={{ uri: item.coverUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary + "15" }]}>
            <Text style={{ fontSize: 28 }}>📚</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.bookInfo}>
          <Text style={[styles.bookTitle, { color: colors.foreground }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.bookAuthor, { color: colors.muted }]} numberOfLines={1}>
            {item.author}
          </Text>
          <Text style={[styles.bookDate, { color: colors.muted }]}>Scanned {scannedDate}</Text>
          <View style={styles.priceRow}>
            <View style={[styles.priceBadge, { backgroundColor: "#10B981" + "15" }]}>
              <Text style={[styles.priceText, { color: "#10B981" }]}>
                {formatPrice(item.bestPrice || 0)}
              </Text>
            </View>
            <Text style={[styles.platformCount, { color: colors.muted }]}>
              {item.prices.length} platforms
            </Text>
          </View>
        </View>

        {/* Delete button (non-select mode) */}
        {!isSelectMode && (
          <Pressable
            style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}
            onPress={() => handleDeleteBook(item)}
          >
            <IconSymbol name="trash.fill" size={16} color={colors.error} />
          </Pressable>
        )}
      </Pressable>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Books</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            {state.scannedBooks.length} book{state.scannedBooks.length !== 1 ? "s" : ""} scanned
          </Text>
        </View>
        <View style={styles.headerActions}>
          {isSelectMode ? (
            <Pressable
              style={({ pressed }) => [styles.headerBtn, { backgroundColor: colors.error + "15" }, pressed && { opacity: 0.7 }]}
              onPress={handleExitSelectMode}
            >
              <Text style={[styles.headerBtnText, { color: colors.error }]}>Cancel</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.headerBtn, { backgroundColor: colors.primary + "15" }, pressed && { opacity: 0.7 }]}
              onPress={() => setIsSelectMode(true)}
            >
              <Text style={[styles.headerBtnText, { color: colors.primary }]}>Select</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Search & Sort */}
      <View style={styles.searchRow}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search books..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {/* Sort buttons */}
        <View style={styles.sortRow}>
          {(["date", "price", "title"] as const).map((s) => (
            <Pressable
              key={s}
              style={[
                styles.sortBtn,
                { backgroundColor: sortBy === s ? colors.primary : colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setSortBy(s)}
            >
              <Text style={[styles.sortText, { color: sortBy === s ? "#FFFFFF" : colors.muted }]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Books List */}
      {state.scannedBooks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📚</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Books Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            Scan a book barcode to get started and discover its market value.
          </Text>
          <Pressable
            style={[styles.scanBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.scanBtnText}>📷 Scan a Book</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          renderItem={renderBook}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}

      {/* Sell Bottom Bar */}
      {isSelectMode && selectedBooks.length > 0 && (
        <View style={[styles.sellBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View>
            <Text style={[styles.sellBarTitle, { color: colors.foreground }]}>
              {selectedBooks.length} book{selectedBooks.length !== 1 ? "s" : ""} selected
            </Text>
            <Text style={[styles.sellBarValue, { color: "#10B981" }]}>
              Est. value: {formatPrice(totalSelectedValue)}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.sellBtn,
              { backgroundColor: "#F59E0B" },
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
            onPress={handleSellSelected}
          >
            <Text style={styles.sellBtnText}>💰 Sell Selected</Text>
          </Pressable>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  headerBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  headerBtnText: { fontSize: 14, fontWeight: "600" },
  searchRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  searchContainer: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },
  sortRow: { flexDirection: "row", gap: 6 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  sortText: { fontSize: 12, fontWeight: "600" },
  list: { paddingHorizontal: 16, paddingBottom: 120 },
  bookCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 12, borderRadius: 16, borderWidth: 1,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    justifyContent: "center", alignItems: "center",
  },
  checkmark: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  cover: { width: 60, height: 85, borderRadius: 8 },
  coverPlaceholder: {
    width: 60, height: 85, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
  },
  bookInfo: { flex: 1, gap: 3 },
  bookTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  bookAuthor: { fontSize: 13 },
  bookDate: { fontSize: 11 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  priceBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  priceText: { fontSize: 13, fontWeight: "700" },
  platformCount: { fontSize: 11 },
  deleteBtn: { padding: 8 },
  emptyState: {
    flex: 1, justifyContent: "center", alignItems: "center",
    paddingHorizontal: 40, gap: 8,
  },
  emptyTitle: { fontSize: 22, fontWeight: "700" },
  emptySubtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  scanBtn: { marginTop: 16, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  scanBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  sellBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, borderTopWidth: 0.5,
  },
  sellBarTitle: { fontSize: 15, fontWeight: "600" },
  sellBarValue: { fontSize: 18, fontWeight: "800", marginTop: 2 },
  sellBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
  sellBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
