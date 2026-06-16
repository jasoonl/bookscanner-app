# BookScan App TODO

## Auth & Onboarding
- [x] Welcome screen with logo, tagline, Sign In / Guest CTAs
- [x] Login screen with Google, Apple, Microsoft, Email options
- [x] Registration form (name, username, DOB, phone, city, country, language)
- [x] Onboarding flow (how found app, why using, favorite genres)
- [x] Guest mode with restricted feature banners
- [x] Auth context/provider with persistent session (AsyncStorage)

## Scanner Tab
- [x] Camera barcode scanner with live view
- [x] ISBN/EAN-13 barcode detection (ean13, ean8, code128, upc_a, upc_e)
- [x] Scan result card (slide-up animation)
- [x] Book lookup via Open Library / Google Books API
- [x] Market price lookup from multiple platforms (10 platforms)
- [x] Add scanned book to My Books list
- [x] Camera permission handling
- [x] Enhanced visual scanning overlay with glow effect
- [x] Pulse animation on barcode detection
- [x] Loading spinner animation during book lookup
- [x] Haptic feedback (medium impact on detection, success/error notifications)

## Book Details
- [x] Book detail screen (cover, title, author, ISBN, description)
- [x] Price history chart (fluctuations over years)
- [x] Multiple platform price comparison
- [x] Sell options from detail screen

## My Books Tab
- [x] Scanned books list with cover thumbnails
- [x] Multi-select mode for selling
- [x] Total estimated sell value display
- [x] Swipe-to-delete books
- [x] Sort/filter options
- [x] "Sell Selected" CTA with platform options

## Sell Options
- [x] Sell options screen with platform list (AbeBooks, eBay, Amazon, ThriftBooks, Alibris, BookFinder, etc.)
- [x] Total value calculation for selected books
- [x] Create in-app listing option

## Marketplace Tab
- [x] Browse all in-app listings
- [x] Search and filter (genre, condition, price range)
- [x] Listing cards with cover, price, condition, seller info
- [x] Listing detail screen with contact seller / buy now

## My Listings Tab
- [x] User's active listings list
- [x] Create listing form (price, condition, description)
- [x] Listing status management (Active/Sold/Paused)
- [x] Buyer inquiry notifications (in-app)
- [x] Notification badge on tab

## Payment & Profile
- [x] Profile screen with user stats and genres
- [x] Payment methods screen (credit card, PayPal, Zelle, Venmo, Cash App)
- [x] Edit profile screen
- [x] Logout functionality

## Branding
- [x] App logo generation (book + scan line + price chart)
- [x] Theme colors (indigo #4F46E5 + green accents)
- [x] App config update (BookScan)
