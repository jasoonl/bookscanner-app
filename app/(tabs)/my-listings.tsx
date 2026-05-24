import { useState } from "react";
import {
  View, Text, FlatList, Pressable, StyleSheet, Image, Alert
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/bookService";
import { BOOK_CONDITIONS } from "@/shared/types";
import type { BookListing, BuyerInquiry } from "@/shared/types";

type TabType = "listings" | "notifications";

const CONDITION_COLORS: Record<string, string> = {
  new: "#10B981", like_new: "#34D399", very_good: "#6366F1",
  good: "#F59E0B", acceptable: "#EF4444",
};

function ListingItem({ listing, onEdit, onDelete, onToggleStatus }: {
  listing: BookListing;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const colors = useColors();
  const conditionLabel = BOOK_CONDITIONS.find((c) => c.value === listing.condition)?.label || listing.condition;
  const conditionColor = CONDITION_COLORS[listing.condition] || colors.muted;

  const statusColors = {
    active: "#10B981",
    sold: "#6366F1",
    paused: "#F59E0B",
  };

  return (
    <View style={[styles.listingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.listingRow}>
        {listing.coverUrl ? (
          <Image source={{ uri: listing.coverUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary + "15" }]}>
            <Text style={{ fontSize: 28 }}>📚</Text>
          </View>
        )}

        <View style={styles.listingInfo}>
          <Text style={[styles.listingTitle, { color: colors.foreground }]} numberOfLines={2}>
            {listing.title}
          </Text>
          <Text style={[styles.listingAuthor, { color: colors.muted }]} numberOfLines={1}>
            by {listing.author}
          </Text>

          <View style={styles.listingMeta}>
            <View style={[styles.conditionBadge, { backgroundColor: conditionColor + "20" }]}>
              <Text style={[styles.conditionText, { color: conditionColor }]}>{conditionLabel}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[listing.status] + "20" }]}>
              <Text style={[styles.statusText, { color: statusColors[listing.status] }]}>
                {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
              </Text>
            </View>
          </View>

          <Text style={[styles.listingPrice, { color: "#10B981" }]}>{formatPrice(listing.price)}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.listingActions, { borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
          onPress={onToggleStatus}
        >
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>
            {listing.status === "active" ? "Pause" : "Activate"}
          </Text>
        </Pressable>
        <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
          onPress={onEdit}
        >
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Edit</Text>
        </Pressable>
        <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
          onPress={onDelete}
        >
          <Text style={[styles.actionBtnText, { color: colors.error }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

function NotificationItem({ notification, onMarkRead }: {
  notification: BuyerInquiry;
  onMarkRead: () => void;
}) {
  const colors = useColors();
  const time = new Date(notification.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <Pressable
      style={[
        styles.notifCard,
        {
          backgroundColor: notification.isRead ? colors.surface : colors.primary + "08",
          borderColor: notification.isRead ? colors.border : colors.primary + "40",
        },
      ]}
      onPress={onMarkRead}
    >
      <View style={styles.notifLeft}>
        <View style={[styles.notifIcon, { backgroundColor: colors.primary + "15" }]}>
          <Text style={{ fontSize: 20 }}>🛒</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.notifTitle, { color: colors.foreground }]}>
            {notification.buyerName} is interested in buying!
          </Text>
          {notification.message && (
            <Text style={[styles.notifMessage, { color: colors.muted }]} numberOfLines={2}>
              "{notification.message}"
            </Text>
          )}
          {notification.buyerPhone && (
            <Text style={[styles.notifPhone, { color: colors.primary }]}>
              📞 {notification.buyerPhone}
            </Text>
          )}
          <Text style={[styles.notifTime, { color: colors.muted }]}>{time}</Text>
        </View>
      </View>
      {!notification.isRead && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </Pressable>
  );
}

export default function MyListingsTab() {
  const colors = useColors();
  const { state, dispatch } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>("listings");

  const handleDeleteListing = (listing: BookListing) => {
    Alert.alert(
      "Delete Listing",
      `Delete listing for "${listing.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            dispatch({ type: "REMOVE_LISTING", id: listing.id });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const handleToggleStatus = (listing: BookListing) => {
    const newStatus = listing.status === "active" ? "paused" : "active";
    dispatch({
      type: "UPDATE_LISTING",
      listing: { ...listing, status: newStatus, updatedAt: new Date().toISOString() },
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleMarkRead = (id: string) => {
    dispatch({ type: "MARK_NOTIFICATION_READ", id });
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Listings</Text>
        <Pressable
          style={({ pressed }) => [
            styles.createBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
          onPress={() => {
            if (state.scannedBooks.length === 0) {
              Alert.alert("No Books", "Scan some books first to create listings.");
              return;
            }
            router.push({
              pathname: "/create-listing",
              params: { bookJson: JSON.stringify(state.scannedBooks[0]) },
            });
          }}
        >
          <Text style={styles.createBtnText}>+ New Listing</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {(["listings", "notifications"] as TabType[]).map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => { setActiveTab(tab); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.muted }]}>
              {tab === "listings" ? "My Listings" : "Notifications"}
            </Text>
            {tab === "notifications" && state.unreadNotificationCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={styles.badgeText}>{state.unreadNotificationCount}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* Listings Tab */}
      {activeTab === "listings" && (
        <FlatList
          data={state.listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListingItem
              listing={item}
              onEdit={() => router.push({ pathname: "/create-listing", params: { listingJson: JSON.stringify(item) } })}
              onDelete={() => handleDeleteListing(item)}
              onToggleStatus={() => handleToggleStatus(item)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 56, marginBottom: 16 }}>🏪</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Listings Yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                Create your first listing to start selling books in the BookScan Marketplace.
              </Text>
              <Pressable
                style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  if (state.scannedBooks.length > 0) {
                    router.push({ pathname: "/create-listing", params: { bookJson: JSON.stringify(state.scannedBooks[0]) } });
                  } else {
                    router.push("/(tabs)");
                  }
                }}
              >
                <Text style={styles.emptyBtnText}>
                  {state.scannedBooks.length > 0 ? "Create a Listing" : "Scan a Book First"}
                </Text>
              </Pressable>
            </View>
          )}
        />
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <FlatList
          data={state.notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem notification={item} onMarkRead={() => handleMarkRead(item.id)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListHeaderComponent={() =>
            state.notifications.length > 0 ? (
              <View style={styles.notifHeader}>
                <Text style={[styles.notifHeaderText, { color: colors.muted }]}>
                  {state.unreadNotificationCount} unread notification{state.unreadNotificationCount !== 1 ? "s" : ""}
                </Text>
                {state.unreadNotificationCount > 0 && (
                  <Pressable
                    onPress={() => {
                      state.notifications.forEach((n) => {
                        if (!n.isRead) dispatch({ type: "MARK_NOTIFICATION_READ", id: n.id });
                      });
                    }}
                  >
                    <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
                  </Pressable>
                )}
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 56, marginBottom: 16 }}>🔔</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Notifications</Text>
              <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                You'll be notified here when buyers are interested in your listings.
              </Text>
            </View>
          )}
        />
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
  createBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20 },
  createBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  tabBar: {
    flexDirection: "row", borderBottomWidth: 0.5,
  },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 14, gap: 6,
  },
  tabText: { fontSize: 15, fontWeight: "600" },
  badge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 18,
    alignItems: "center",
  },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  list: { padding: 16, paddingBottom: 100 },
  listingCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  listingRow: { flexDirection: "row", gap: 14, padding: 14 },
  cover: { width: 60, height: 85, borderRadius: 8 },
  coverPlaceholder: {
    width: 60, height: 85, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
  },
  listingInfo: { flex: 1, gap: 4 },
  listingTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  listingAuthor: { fontSize: 13 },
  listingMeta: { flexDirection: "row", gap: 8, marginTop: 4 },
  conditionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  conditionText: { fontSize: 11, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "600" },
  listingPrice: { fontSize: 17, fontWeight: "800", marginTop: 4 },
  listingActions: {
    flexDirection: "row", borderTopWidth: 0.5,
  },
  actionBtn: { flex: 1, paddingVertical: 12, alignItems: "center" },
  actionBtnText: { fontSize: 14, fontWeight: "600" },
  actionDivider: { width: 0.5 },
  notifCard: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
    padding: 14, borderRadius: 16, borderWidth: 1,
  },
  notifLeft: { flexDirection: "row", gap: 12, flex: 1 },
  notifIcon: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  notifTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4, lineHeight: 20 },
  notifMessage: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  notifPhone: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  notifTime: { fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  notifHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 12,
  },
  notifHeaderText: { fontSize: 13 },
  markAllText: { fontSize: 13, fontWeight: "600" },
  emptyState: {
    paddingTop: 60, alignItems: "center", paddingHorizontal: 32, gap: 8,
  },
  emptyTitle: { fontSize: 22, fontWeight: "700" },
  emptySubtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  emptyBtn: { marginTop: 16, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  emptyBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
