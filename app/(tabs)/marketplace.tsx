import { useState, useMemo } from "react";
import {
  View, Text, FlatList, Pressable, StyleSheet, Image, TextInput
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/bookService";
import { BOOK_CONDITIONS } from "@/shared/types";
import type { BookListing } from "@/shared/types";

// Sample marketplace listings for demo
const DEMO_LISTINGS: BookListing[] = [
  {
    id: "demo1", userId: "user2", userName: "Sarah M.", userPhone: "+1-555-0101",
    isbn: "9780061965487", title: "The Great Gatsby", author: "F. Scott Fitzgerald",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780061965487-L.jpg",
    price: 8.99, condition: "very_good", description: "Great condition, no markings",
    status: "active", createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "demo2", userId: "user3", userName: "James K.", userPhone: "+1-555-0102",
    isbn: "9780743273565", title: "The Great Gatsby", author: "F. Scott Fitzgerald",
    price: 6.50, condition: "good", description: "Some highlighting in first chapter",
    status: "active", createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "demo3", userId: "user4", userName: "Emma L.", userPhone: "+1-555-0103",
    isbn: "9780062316097", title: "The Alchemist", author: "Paulo Coelho",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
    price: 12.00, condition: "like_new", description: "Read once, like new",
    status: "active", createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "demo4", userId: "user5", userName: "Mike R.", userPhone: "+1-555-0104",
    isbn: "9780316769174", title: "The Catcher in the Rye", author: "J.D. Salinger",
    price: 7.25, condition: "good", description: "Classic edition, minor wear",
    status: "active", createdAt: new Date(Date.now() - 345600000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "demo5", userId: "user6", userName: "Lisa T.", userPhone: "+1-555-0105",
    isbn: "9780385490818", title: "The Handmaid's Tale", author: "Margaret Atwood",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780385490818-L.jpg",
    price: 9.50, condition: "very_good", description: "Excellent condition",
    status: "active", createdAt: new Date(Date.now() - 432000000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "demo6", userId: "user7", userName: "David W.", userPhone: "+1-555-0106",
    isbn: "9780743477109", title: "1984", author: "George Orwell",
    price: 5.99, condition: "acceptable", description: "Well-read but all pages intact",
    status: "active", createdAt: new Date(Date.now() - 518400000).toISOString(), updatedAt: new Date().toISOString(),
  },
];

const CONDITION_COLORS: Record<string, string> = {
  new: "#10B981",
  like_new: "#34D399",
  very_good: "#6366F1",
  good: "#F59E0B",
  acceptable: "#EF4444",
};

function ListingCard({ listing, onPress }: { listing: BookListing; onPress: () => void }) {
  const colors = useColors();
  const conditionLabel = BOOK_CONDITIONS.find((c) => c.value === listing.condition)?.label || listing.condition;
  const conditionColor = CONDITION_COLORS[listing.condition] || colors.muted;
  const listedDate = new Date(listing.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
      onPress={onPress}
    >
      {listing.coverUrl ? (
        <Image source={{ uri: listing.coverUrl }} style={styles.cover} resizeMode="cover" />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary + "15" }]}>
          <Text style={{ fontSize: 32 }}>📚</Text>
        </View>
      )}

      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={[styles.cardAuthor, { color: colors.muted }]} numberOfLines={1}>
          by {listing.author}
        </Text>

        <View style={styles.cardMeta}>
          <View style={[styles.conditionBadge, { backgroundColor: conditionColor + "20" }]}>
            <Text style={[styles.conditionText, { color: conditionColor }]}>{conditionLabel}</Text>
          </View>
          <Text style={[styles.sellerText, { color: colors.muted }]}>by {listing.userName}</Text>
        </View>

        <View style={styles.cardBottom}>
          <Text style={[styles.price, { color: "#10B981" }]}>{formatPrice(listing.price)}</Text>
          <Text style={[styles.listedDate, { color: colors.muted }]}>{listedDate}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function MarketplaceTab() {
  const colors = useColors();
  const { state } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCondition, setFilterCondition] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "price_low" | "price_high">("date");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Combine demo listings with user's own listings
  const allListings = useMemo(() => {
    const userListings = state.listings.filter((l) => l.status === "active");
    return [...userListings, ...DEMO_LISTINGS];
  }, [state.listings]);

  const filteredListings = useMemo(() => {
    return allListings
      .filter((l) => {
        if (filterCondition !== "all" && l.condition !== filterCondition) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return l.title.toLowerCase().includes(q) || l.author.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_low") return a.price - b.price;
        if (sortBy === "price_high") return b.price - a.price;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [allListings, searchQuery, filterCondition, sortBy]);

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Marketplace</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            {filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""} available
          </Text>
        </View>
        <View style={styles.viewToggle}>
          <Pressable
            style={[styles.viewBtn, viewMode === "list" && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode("list")}
          >
            <IconSymbol name="list.bullet" size={18} color={viewMode === "list" ? "#FFFFFF" : colors.muted} />
          </Pressable>
          <Pressable
            style={[styles.viewBtn, viewMode === "grid" && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode("grid")}
          >
            <IconSymbol name="square.grid.2x2.fill" size={18} color={viewMode === "grid" ? "#FFFFFF" : colors.muted} />
          </Pressable>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search books, authors..."
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
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { id: "all", label: "All" },
            { id: "new", label: "New" },
            { id: "like_new", label: "Like New" },
            { id: "very_good", label: "Very Good" },
            { id: "good", label: "Good" },
            { id: "acceptable", label: "Acceptable" },
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.filterChip,
                {
                  backgroundColor: filterCondition === item.id ? colors.primary : colors.surface,
                  borderColor: filterCondition === item.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => { setFilterCondition(item.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Text style={[styles.filterText, { color: filterCondition === item.id ? "#FFFFFF" : colors.muted }]}>
                {item.label}
              </Text>
            </Pressable>
          )}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {/* Sort */}
      <View style={styles.sortRow}>
        <Text style={[styles.sortLabel, { color: colors.muted }]}>Sort:</Text>
        {([
          { id: "date", label: "Newest" },
          { id: "price_low", label: "Price ↑" },
          { id: "price_high", label: "Price ↓" },
        ] as const).map((s) => (
          <Pressable
            key={s.id}
            style={[styles.sortBtn, sortBy === s.id && { backgroundColor: colors.primary + "15" }]}
            onPress={() => setSortBy(s.id)}
          >
            <Text style={[styles.sortBtnText, { color: sortBy === s.id ? colors.primary : colors.muted }]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Listings */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: "/listing-detail", params: { listingJson: JSON.stringify(item) } });
            }}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Listings Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      />
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
  viewToggle: {
    flexDirection: "row", borderRadius: 10, overflow: "hidden",
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  viewBtn: { padding: 8 },
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchContainer: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filtersRow: { paddingVertical: 8 },
  filtersContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  sortRow: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingBottom: 8, gap: 4,
  },
  sortLabel: { fontSize: 13, marginRight: 4 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  sortBtnText: { fontSize: 13, fontWeight: "600" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    flexDirection: "row", gap: 14, padding: 14,
    borderRadius: 16, borderWidth: 1,
  },
  cover: { width: 70, height: 100, borderRadius: 10 },
  coverPlaceholder: {
    width: 70, height: 100, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
  },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  cardAuthor: { fontSize: 13 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  conditionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  conditionText: { fontSize: 11, fontWeight: "600" },
  sellerText: { fontSize: 11 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  price: { fontSize: 18, fontWeight: "800" },
  listedDate: { fontSize: 11 },
  emptyState: {
    paddingTop: 60, alignItems: "center", gap: 8,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySubtitle: { fontSize: 14, textAlign: "center" },
});
