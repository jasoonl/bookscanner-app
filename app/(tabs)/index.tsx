import { useState, useRef, useCallback } from "react";
import {
  View, Text, Pressable, StyleSheet, Dimensions, ActivityIndicator,
  Image, ScrollView, Animated, Alert, Platform
} from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { useFocusEffect, router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";
import { lookupBook, formatPrice } from "@/lib/bookService";
import type { ScannedBook } from "@/shared/types";

const { width, height } = Dimensions.get("window");
const SCAN_FRAME_SIZE = width * 0.72;

export default function ScannerTab() {
  const colors = useColors();
  const { state, dispatch } = useAppStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scannedBook, setScannedBook] = useState<ScannedBook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Activate camera only when tab is focused
  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      startScanAnimation();
      return () => {
        setIsActive(false);
        setScanned(false);
      };
    }, [])
  );

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  };

  const showResultCard = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const hideResultCard = () => {
    Animated.timing(slideAnim, {
      toValue: 500,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setScannedBook(null);
      setError(null);
      setScanned(false);
    });
  };

  const onBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned || isLoading) return;
    setScanned(true);
    setIsLoading(true);
    setError(null);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      const book = await lookupBook(data);
      if (book) {
        setScannedBook(book);
        showResultCard();
      } else {
        setError(`No book found for barcode: ${data}`);
        setScanned(false);
      }
    } catch (err) {
      setError("Failed to look up book. Please try again.");
      setScanned(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToMyBooks = () => {
    if (!scannedBook) return;
    const exists = state.scannedBooks.find((b) => b.isbn === scannedBook.isbn);
    if (exists) {
      Alert.alert("Already Added", "This book is already in your collection.");
    } else {
      dispatch({ type: "ADD_SCANNED_BOOK", book: scannedBook });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Added!", `"${scannedBook.title}" has been added to My Books.`);
    }
    hideResultCard();
  };

  const handleViewDetails = () => {
    if (!scannedBook) return;
    router.push({ pathname: "/book-detail", params: { isbn: scannedBook.isbn, bookJson: JSON.stringify(scannedBook) } });
    hideResultCard();
  };

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_FRAME_SIZE - 4],
  });

  // Permission not determined yet
  if (!permission) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: 48, marginBottom: 20 }}>📷</Text>
        <Text style={[styles.permTitle, { color: colors.foreground }]}>Camera Access Needed</Text>
        <Text style={[styles.permSubtitle, { color: colors.muted }]}>
          BookScan needs camera access to scan book barcodes and ISBNs.
        </Text>
        <Pressable
          style={[styles.permBtn, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.permBtnText}>Grant Camera Access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      {isActive && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "code128", "upc_a", "upc_e"] }}
          onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
        />
      )}

      {/* Dark overlay with scan frame */}
      <View style={styles.overlay}>
        {/* Top overlay */}
        <View style={[styles.overlaySection, { backgroundColor: "rgba(0,0,0,0.55)" }]} />

        {/* Middle row */}
        <View style={styles.middleRow}>
          <View style={[styles.overlaySide, { backgroundColor: "rgba(0,0,0,0.55)" }]} />

          {/* Scan Frame */}
          <View style={[styles.scanFrame, { width: SCAN_FRAME_SIZE, height: SCAN_FRAME_SIZE * 0.65 }]}>
            {/* Corner brackets */}
            {[
              { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
              { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
              { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
              { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
            ].map((corner, i) => (
              <View key={i} style={[styles.corner, corner, { borderColor: "#F59E0B" }]} />
            ))}

            {/* Scan line */}
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLineTranslate }] },
              ]}
            />
          </View>

          <View style={[styles.overlaySide, { backgroundColor: "rgba(0,0,0,0.55)" }]} />
        </View>

        {/* Bottom overlay */}
        <View style={[styles.overlaySection, { backgroundColor: "rgba(0,0,0,0.55)", flex: 2 }]}>
          <Text style={styles.scanHint}>Point camera at a book barcode or ISBN</Text>
          {isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#F59E0B" size="small" />
              <Text style={styles.loadingText}>Looking up book...</Text>
            </View>
          )}
          {error && (
            <View style={styles.errorRow}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => { setError(null); setScanned(false); }}>
                <Text style={styles.retryText}>Try Again</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BookScan</Text>
        <Text style={styles.headerSubtitle}>Scan any book barcode</Text>
      </View>

      {/* Result Card */}
      {scannedBook && (
        <Animated.View
          style={[
            styles.resultCard,
            { backgroundColor: colors.background, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={[styles.resultHandle, { backgroundColor: colors.border }]} />

          <View style={styles.resultContent}>
            {/* Book Cover */}
            {scannedBook.coverUrl ? (
              <Image source={{ uri: scannedBook.coverUrl }} style={styles.bookCover} resizeMode="cover" />
            ) : (
              <View style={[styles.bookCoverPlaceholder, { backgroundColor: colors.primary + "20" }]}>
                <Text style={{ fontSize: 40 }}>📚</Text>
              </View>
            )}

            {/* Book Info */}
            <View style={styles.bookInfo}>
              <Text style={[styles.bookTitle, { color: colors.foreground }]} numberOfLines={2}>
                {scannedBook.title}
              </Text>
              <Text style={[styles.bookAuthor, { color: colors.muted }]} numberOfLines={1}>
                by {scannedBook.author}
              </Text>
              {scannedBook.publishedYear && (
                <Text style={[styles.bookYear, { color: colors.muted }]}>
                  {scannedBook.publishedYear} · {scannedBook.pageCount ? `${scannedBook.pageCount} pages` : ""}
                </Text>
              )}

              {/* Best Price */}
              <View style={styles.priceRow}>
                <View style={[styles.priceBadge, { backgroundColor: "#10B981" + "20" }]}>
                  <Text style={[styles.priceLabel, { color: "#10B981" }]}>Best Price</Text>
                  <Text style={[styles.priceValue, { color: "#10B981" }]}>
                    {formatPrice(scannedBook.bestPrice || 0)}
                  </Text>
                </View>
                <View style={[styles.priceBadge, { backgroundColor: colors.warning + "20" }]}>
                  <Text style={[styles.priceLabel, { color: colors.warning }]}>Platforms</Text>
                  <Text style={[styles.priceValue, { color: colors.warning }]}>
                    {scannedBook.prices.length}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.actionBtnSecondary,
                { borderColor: colors.primary },
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleViewDetails}
            >
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Full Details</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
              onPress={handleAddToMyBooks}
            >
              <Text style={[styles.actionBtnText, { color: "#FFFFFF" }]}>+ Add to My Books</Text>
            </Pressable>
          </View>

          <Pressable style={styles.dismissBtn} onPress={hideResultCard}>
            <Text style={[styles.dismissText, { color: colors.muted }]}>Dismiss</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: "column" },
  overlaySection: { width: "100%", flex: 1 },
  middleRow: { flexDirection: "row", alignItems: "center" },
  overlaySide: { flex: 1, alignSelf: "stretch" },
  scanFrame: {
    position: "relative",
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
  },
  scanLine: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: "#F59E0B",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  scanHint: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 24,
    fontWeight: "500",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  loadingText: { color: "#F59E0B", fontSize: 14, fontWeight: "500" },
  errorRow: { alignItems: "center", marginTop: 12, gap: 8 },
  errorText: { color: "#F87171", fontSize: 13, textAlign: "center" },
  retryText: { color: "#F59E0B", fontSize: 14, fontWeight: "600" },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  headerTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  headerSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },
  resultCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  resultHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  resultContent: { flexDirection: "row", gap: 16, marginBottom: 16 },
  bookCover: { width: 80, height: 110, borderRadius: 8 },
  bookCoverPlaceholder: {
    width: 80, height: 110, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
  },
  bookInfo: { flex: 1, gap: 4 },
  bookTitle: { fontSize: 17, fontWeight: "700", lineHeight: 22 },
  bookAuthor: { fontSize: 14 },
  bookYear: { fontSize: 12 },
  priceRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  priceBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, alignItems: "center" },
  priceLabel: { fontSize: 10, fontWeight: "600" },
  priceValue: { fontSize: 15, fontWeight: "800" },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  actionBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center",
  },
  actionBtnSecondary: { borderWidth: 2 },
  actionBtnText: { fontSize: 15, fontWeight: "700" },
  dismissBtn: { alignItems: "center", paddingVertical: 8 },
  dismissText: { fontSize: 14 },
  permTitle: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  permSubtitle: { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 28 },
  permBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  permBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
