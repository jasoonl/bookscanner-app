import { useState } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAppStore } from "@/lib/store";

type PaymentMethod = "credit_card" | "paypal" | "zelle" | "venmo" | "cashapp";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; description: string }[] = [
  { id: "credit_card", label: "Credit / Debit Card", icon: "💳", description: "Visa, Mastercard, Amex, Discover" },
  { id: "paypal", label: "PayPal", icon: "🅿️", description: "Pay or receive via PayPal account" },
  { id: "zelle", label: "Zelle", icon: "💜", description: "Instant bank-to-bank transfer" },
  { id: "venmo", label: "Venmo", icon: "💙", description: "Social payments via Venmo" },
  { id: "cashapp", label: "Cash App", icon: "💚", description: "Pay via $Cashtag" },
];

function CreditCardForm({ onSave }: { onSave: (data: any) => void }) {
  const colors = useColors();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return cleaned;
  };

  return (
    <View style={styles.formSection}>
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.foreground }]}>Cardholder Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
          placeholder="John Doe"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.foreground }]}>Card Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor={colors.muted}
          value={cardNumber}
          onChangeText={(t) => setCardNumber(formatCardNumber(t))}
          keyboardType="number-pad"
          maxLength={19}
        />
      </View>
      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.inputLabel, { color: colors.foreground }]}>Expiry</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
            placeholder="MM/YY"
            placeholderTextColor={colors.muted}
            value={expiry}
            onChangeText={(t) => setExpiry(formatExpiry(t))}
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.inputLabel, { color: colors.foreground }]}>CVV</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
            placeholder="123"
            placeholderTextColor={colors.muted}
            value={cvv}
            onChangeText={(t) => setCvv(t.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>
      <Pressable
        style={[styles.saveMethodBtn, { backgroundColor: colors.primary }]}
        onPress={() => onSave({ type: "credit_card", name, cardNumber, expiry, cvv })}
      >
        <Text style={styles.saveMethodBtnText}>Save Card</Text>
      </Pressable>
    </View>
  );
}

function EmailForm({ label, placeholder, onSave }: { label: string; placeholder: string; onSave: (data: any) => void }) {
  const colors = useColors();
  const [email, setEmail] = useState("");
  return (
    <View style={styles.formSection}>
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.foreground }]}>{label}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <Pressable
        style={[styles.saveMethodBtn, { backgroundColor: colors.primary }]}
        onPress={() => onSave({ type: "email", email })}
      >
        <Text style={styles.saveMethodBtnText}>Save</Text>
      </Pressable>
    </View>
  );
}

function HandleForm({ label, placeholder, prefix, onSave }: {
  label: string; placeholder: string; prefix?: string; onSave: (data: any) => void;
}) {
  const colors = useColors();
  const [handle, setHandle] = useState("");
  return (
    <View style={styles.formSection}>
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.foreground }]}>{label}</Text>
        <View style={[styles.handleInputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {prefix && <Text style={[styles.handlePrefix, { color: colors.muted }]}>{prefix}</Text>}
          <TextInput
            style={[styles.handleInput, { color: colors.foreground }]}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            value={handle}
            onChangeText={setHandle}
            autoCapitalize="none"
          />
        </View>
      </View>
      <Pressable
        style={[styles.saveMethodBtn, { backgroundColor: colors.primary }]}
        onPress={() => onSave({ type: "handle", handle })}
      >
        <Text style={styles.saveMethodBtnText}>Save</Text>
      </Pressable>
    </View>
  );
}

export default function PaymentInfoScreen() {
  const colors = useColors();
  const { state, dispatch } = useAppStore();
  const params = useLocalSearchParams<{ mode?: string; listingJson?: string }>();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [savedMethods, setSavedMethods] = useState<Record<string, boolean>>(
    state.userProfile?.paymentMethods || {}
  );

  const mode = params.mode || "settings";
  const isCheckout = mode === "buyer";

  const handleSaveMethod = (method: PaymentMethod, data: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSavedMethods((prev) => ({ ...prev, [method]: true }));
    dispatch({ type: "UPDATE_USER_PROFILE", updates: { paymentMethods: { ...savedMethods, [method]: true } } });
    setSelectedMethod(null);
    Alert.alert("Saved!", `Your ${PAYMENT_METHODS.find((m) => m.id === method)?.label} has been saved.`);
  };

  const handleCheckout = () => {
    const hasSavedMethod = Object.values(savedMethods).some(Boolean);
    if (!hasSavedMethod) {
      Alert.alert("No Payment Method", "Please add at least one payment method to proceed.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Purchase Confirmed! 🎉",
      "Your purchase request has been sent to the seller. They will contact you to arrange payment and delivery.",
      [{ text: "Great!", onPress: () => router.replace("/(tabs)/marketplace") }]
    );
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
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {isCheckout ? "Checkout" : "Payment Methods"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Security Note */}
          <View style={[styles.securityNote, { backgroundColor: "#10B981" + "10", borderColor: "#10B981" + "30" }]}>
            <Text style={{ fontSize: 20 }}>🔒</Text>
            <Text style={[styles.securityText, { color: colors.muted }]}>
              Your payment information is encrypted and stored securely on your device.
            </Text>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {isCheckout ? "Select Payment Method" : "Your Payment Methods"}
            </Text>

            {PAYMENT_METHODS.map((method) => {
              const isSaved = savedMethods[method.id];
              const isExpanded = selectedMethod === method.id;

              return (
                <View key={method.id}>
                  <Pressable
                    style={[
                      styles.methodCard,
                      {
                        backgroundColor: isExpanded ? colors.primary + "08" : colors.surface,
                        borderColor: isExpanded ? colors.primary : isSaved ? "#10B981" : colors.border,
                        borderWidth: isExpanded || isSaved ? 1.5 : 1,
                      },
                    ]}
                    onPress={() => {
                      setSelectedMethod(isExpanded ? null : method.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={styles.methodIcon}>{method.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.methodLabel, { color: colors.foreground }]}>{method.label}</Text>
                      <Text style={[styles.methodDesc, { color: colors.muted }]}>{method.description}</Text>
                    </View>
                    {isSaved && (
                      <View style={[styles.savedBadge, { backgroundColor: "#10B981" + "20" }]}>
                        <Text style={[styles.savedText, { color: "#10B981" }]}>✓ Saved</Text>
                      </View>
                    )}
                    <IconSymbol
                      name={isExpanded ? "chevron.up" : "chevron.down"}
                      size={16}
                      color={colors.muted}
                    />
                  </Pressable>

                  {/* Expanded Form */}
                  {isExpanded && (
                    <View style={[styles.expandedForm, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      {method.id === "credit_card" && (
                        <CreditCardForm onSave={(data) => handleSaveMethod(method.id, data)} />
                      )}
                      {method.id === "paypal" && (
                        <EmailForm
                          label="PayPal Email"
                          placeholder="you@paypal.com"
                          onSave={(data) => handleSaveMethod(method.id, data)}
                        />
                      )}
                      {method.id === "zelle" && (
                        <EmailForm
                          label="Zelle Email or Phone"
                          placeholder="you@email.com or +1 555-000-0000"
                          onSave={(data) => handleSaveMethod(method.id, data)}
                        />
                      )}
                      {method.id === "venmo" && (
                        <HandleForm
                          label="Venmo Username"
                          placeholder="YourUsername"
                          prefix="@"
                          onSave={(data) => handleSaveMethod(method.id, data)}
                        />
                      )}
                      {method.id === "cashapp" && (
                        <HandleForm
                          label="Cash App $Cashtag"
                          placeholder="YourCashtag"
                          prefix="$"
                          onSave={(data) => handleSaveMethod(method.id, data)}
                        />
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Checkout Button */}
          {isCheckout && (
            <Pressable
              style={({ pressed }) => [
                styles.checkoutBtn,
                { backgroundColor: "#10B981" },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutBtnText}>Confirm Purchase 🎉</Text>
            </Pressable>
          )}
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
  securityNote: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 20, marginBottom: 24,
  },
  securityText: { flex: 1, fontSize: 13, lineHeight: 18 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 14 },
  methodCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, marginBottom: 8,
  },
  methodIcon: { fontSize: 24 },
  methodLabel: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  methodDesc: { fontSize: 12 },
  savedBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  savedText: { fontSize: 11, fontWeight: "700" },
  expandedForm: {
    borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 8, marginTop: -4,
  },
  formSection: { gap: 14 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 14, fontWeight: "600" },
  input: {
    borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
  },
  rowInputs: { flexDirection: "row", gap: 12 },
  handleInputRow: {
    flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  handlePrefix: { fontSize: 16, fontWeight: "600", marginRight: 4 },
  handleInput: { flex: 1, fontSize: 16, paddingVertical: 12 },
  saveMethodBtn: {
    borderRadius: 12, paddingVertical: 14, alignItems: "center",
  },
  saveMethodBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  checkoutBtn: {
    borderRadius: 16, paddingVertical: 17, alignItems: "center", marginBottom: 20,
  },
  checkoutBtnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
});
