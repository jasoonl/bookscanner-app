// ─── Book Types ────────────────────────────────────────────────────────────────

export type BookCondition = "new" | "like_new" | "very_good" | "good" | "acceptable";

export interface BookPrice {
  platform: string;
  price: number;
  condition: BookCondition;
  url?: string;
  currency?: string;
  lastUpdated?: string;
}

export interface PriceHistoryPoint {
  year: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
}

export interface ScannedBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  genre?: string;
  publishedYear?: number;
  pageCount?: number;
  publisher?: string;
  language?: string;
  prices: BookPrice[];
  bestPrice?: number;
  priceHistory?: PriceHistoryPoint[];
  scannedAt: string;
  isSelected?: boolean;
}

// ─── User Types ────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  city?: string;
  country?: string;
  language?: string;
  isGuest: boolean;
  createdAt: string;
  onboardingComplete: boolean;
  howFoundApp?: string;
  whyUsingApp?: string;
  favoriteGenres?: string[];
  paymentMethods?: Record<string, boolean>;
}

// ─── Listing Types ─────────────────────────────────────────────────────────────

export interface BookListing {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  isbn: string;
  title: string;
  author: string;
  coverUrl?: string;
  price: number;
  condition: BookCondition;
  description?: string;
  status: "active" | "sold" | "paused";
  createdAt: string;
  updatedAt: string;
  buyerInquiries?: BuyerInquiry[];
}

export interface BuyerInquiry {
  id: string;
  listingId: string;
  buyerName: string;
  buyerPhone: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const BOOK_CONDITIONS: { value: BookCondition; label: string; description: string }[] = [
  { value: "new", label: "New", description: "Brand new, never opened" },
  { value: "like_new", label: "Like New", description: "Read once, no marks or damage" },
  { value: "very_good", label: "Very Good", description: "Minor wear, no markings" },
  { value: "good", label: "Good", description: "Some wear, possible minor markings" },
  { value: "acceptable", label: "Acceptable", description: "Heavy wear but fully readable" },
];

export const BOOK_GENRES = [
  "Fiction", "Non-Fiction", "Mystery & Thriller", "Science Fiction",
  "Fantasy", "Romance", "Biography & Memoir", "History", "Science",
  "Self-Help", "Business", "Children's", "Young Adult", "Horror",
  "Poetry", "Graphic Novels", "Cookbooks", "Travel", "Philosophy",
  "Psychology", "Art & Photography", "Religion & Spirituality",
  "Political Science", "True Crime", "Health & Wellness",
];

export const SELL_PLATFORMS = [
  {
    id: "bookscan_marketplace",
    name: "BookScan Marketplace",
    description: "Sell directly to other BookScan users with zero listing fees",
    averageFeePercent: 0,
    url: "",
  },
  {
    id: "amazon",
    name: "Amazon",
    description: "World's largest marketplace with millions of buyers",
    averageFeePercent: 15,
    url: "https://sellercentral.amazon.com",
  },
  {
    id: "ebay",
    name: "eBay",
    description: "Auction or fixed-price listings for books worldwide",
    averageFeePercent: 12,
    url: "https://www.ebay.com/sl/sell",
  },
  {
    id: "abebooks",
    name: "AbeBooks",
    description: "Specialized marketplace for rare, used, and collectible books",
    averageFeePercent: 8,
    url: "https://www.abebooks.com/books/sell-books",
  },
  {
    id: "thriftbooks",
    name: "ThriftBooks",
    description: "Sell to one of the largest used book retailers",
    averageFeePercent: 5,
    url: "https://www.thriftbooks.com/sell",
  },
  {
    id: "alibris",
    name: "Alibris",
    description: "Independent sellers marketplace for books, music & movies",
    averageFeePercent: 10,
    url: "https://www.alibris.com/sell",
  },
  {
    id: "bookfinder",
    name: "BookFinder",
    description: "Compare prices across multiple platforms instantly",
    averageFeePercent: 0,
    url: "https://www.bookfinder.com",
  },
];
