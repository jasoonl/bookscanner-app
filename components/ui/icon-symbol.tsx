import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  // Scanner & Camera
  "camera.fill": "camera-alt",
  "barcode.viewfinder": "qr-code-scanner",
  "viewfinder": "center-focus-strong",
  // Books
  "books.vertical.fill": "menu-book",
  "book.fill": "book",
  "book.closed.fill": "book",
  // Marketplace
  "storefront.fill": "storefront",
  "cart.fill": "shopping-cart",
  "tag.fill": "sell",
  "bag.fill": "shopping-bag",
  // Profile
  "person.crop.circle.fill": "account-circle",
  "person.fill": "person",
  "gear": "settings",
  "gearshape.fill": "settings",
  // Money & Prices
  "dollarsign.circle.fill": "monetization-on",
  "chart.line.uptrend.xyaxis": "trending-up",
  "chart.bar.fill": "bar-chart",
  // Actions
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "minus.circle.fill": "remove-circle",
  "trash.fill": "delete",
  "pencil": "edit",
  "square.and.pencil": "edit",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  "arrow.up.right": "open-in-new",
  // Notifications
  "bell.fill": "notifications",
  "bell.badge.fill": "notifications-active",
  // Misc
  "star.fill": "star",
  "heart.fill": "favorite",
  "magnifyingglass": "search",
  "slider.horizontal.3": "tune",
  "list.bullet": "list",
  "square.grid.2x2.fill": "grid-view",
  "info.circle.fill": "info",
  "exclamationmark.triangle.fill": "warning",
  "creditcard.fill": "credit-card",
  "phone.fill": "phone",
  "envelope.fill": "email",
  "location.fill": "location-on",
  "globe": "language",
  "photo.fill": "photo",
  "camera.on.rectangle.fill": "camera",
  "arrow.clockwise": "refresh",
  "square.and.arrow.up": "share",
  "ellipsis": "more-horiz",
  "ellipsis.circle": "more-horiz",
  "lock.fill": "lock",
  "shield.fill": "security",
  "hand.thumbsup.fill": "thumb-up",
  "hand.thumbsdown.fill": "thumb-down",
  "flame.fill": "local-fire-department",
  "sparkles": "auto-awesome",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
