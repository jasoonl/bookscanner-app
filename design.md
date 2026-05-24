# BookScan App — Interface Design

## Brand Identity
- **App Name:** BookScan
- **Tagline:** Scan, Value & Sell Books
- **Primary Color:** Deep Indigo `#4F46E5` (trust, knowledge)
- **Accent Color:** Amber `#F59E0B` (value, marketplace)
- **Background (light):** `#FAFAF9` warm off-white
- **Background (dark):** `#0F0E17` deep dark
- **Surface:** `#FFFFFF` / `#1C1B29`
- **Success:** `#10B981`
- **Error:** `#EF4444`

---

## Screen List

### Auth & Onboarding
1. **WelcomeScreen** — App logo, tagline, Sign In / Continue as Guest CTAs
2. **LoginScreen** — Google, Apple, Microsoft, Email login options
3. **RegisterScreen** — Full registration form (name, username, DOB, phone, city, country, language)
4. **OnboardingScreen** — 3-step: How did you find us? Why are you using the app? Favorite genres?
5. **GuestBannerScreen** — Persistent guest mode banner with upgrade prompts

### Main Tabs (5 tabs)
6. **ScannerTab** — Barcode scanner with live camera view, scan result overlay
7. **MyBooksTab** — Scanned books list, sell selection, total sell value
8. **MarketplaceTab** — Browse listings from all users, filter/search
9. **MyListingsTab** — User's own listings, buyer notifications
10. **ProfileTab** — Account info, payment methods, settings

### Detail Screens (modal/push)
11. **BookDetailScreen** — Cover, title, author, ISBN, description, price history chart, sell options
12. **PriceHistoryScreen** — Full chart of price fluctuations over years
13. **SellOptionsScreen** — Select books to sell, platform options (AbeBooks, eBay, Amazon, etc.)
14. **CreateListingScreen** — Form to create in-app listing with price, condition, photos
15. **ListingDetailScreen** — View a listing, contact seller, make offer
16. **PaymentInfoScreen** — Credit card, PayPal, Zelle, Venmo, bank transfer setup
17. **NotificationsScreen** — Buyer interest alerts, price alerts

---

## Primary Content & Functionality

### ScannerTab
- Full-screen camera view with barcode overlay guide frame
- EAN-13, ISBN-10/13, Code128 support
- Instant scan feedback (haptic + sound)
- Book result card slides up from bottom
- Shows: cover image, title, author, best price, condition options
- "Add to My Books" and "See Full Details" CTAs

### MyBooksTab
- FlatList of all scanned books with cover thumbnails
- Each item: title, author, best market price, date scanned
- Multi-select mode for sell selection
- Bottom bar: "Sell Selected" with total estimated value
- Swipe-to-delete individual books
- Sort/filter options (by date, price, title)

### MarketplaceTab
- Browse all in-app listings
- Search bar + filters (genre, condition, price range)
- Card grid or list toggle
- Each card: cover, title, price, seller rating, condition

### MyListingsTab
- User's active listings
- Badge for new buyer inquiries
- Listing status: Active / Sold / Paused
- Notification feed for buyer interest

### ProfileTab
- User avatar, name, username, stats (books scanned, sold, listed)
- Payment methods section
- Settings: notifications, language, theme
- Logout button

---

## Key User Flows

### New User Flow
1. WelcomeScreen → tap "Sign In" → LoginScreen
2. Choose provider (Google/Apple/Microsoft/Email) → RegisterScreen
3. Fill profile details → OnboardingScreen (3 steps)
4. Land on ScannerTab

### Guest Flow
1. WelcomeScreen → "Continue as Guest" → ScannerTab
2. Guest banner shown on restricted features (My Listings, Payment)

### Scan & Lookup Flow
1. ScannerTab → point camera at barcode → auto-detect ISBN
2. Haptic feedback on scan → result card animates up
3. Shows best price from multiple platforms
4. Tap "Full Details" → BookDetailScreen with price history chart
5. Tap "Add to My Books" → saved to MyBooksTab

### Sell Flow
1. MyBooksTab → tap "Sell" → multi-select books
2. Bottom bar shows total estimated value
3. Tap "View Sell Options" → SellOptionsScreen
4. Shows platforms (AbeBooks, eBay, Amazon Marketplace, ThriftBooks, etc.)
5. Tap platform → opens in-app browser or creates in-app listing

### Create Listing Flow
1. MyBooksTab or SellOptionsScreen → "List In-App"
2. CreateListingScreen: set price, condition, photos, description
3. Listing goes live on MarketplaceTab
4. Buyer taps interest → seller gets notification (push + in-app)
5. Seller contacts buyer via phone or in-app message

### Payment Setup Flow
1. ProfileTab → Payment Methods
2. Add: Credit/Debit card, PayPal email, Zelle phone/email, Venmo handle, Bank transfer
3. Verified badge shown after confirmation

---

## Color Choices
- Primary Indigo `#4F46E5` — buttons, active tabs, highlights
- Amber `#F59E0B` — price tags, value indicators, sell CTAs
- Emerald `#10B981` — success states, "good price" indicators
- Rose `#F43F5E` — price drops, alerts
- Slate grays — text hierarchy
