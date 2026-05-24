import { describe, it, expect } from "vitest";

// ─── Test shared types ───────────────────────────────────────────────────────

import { BOOK_GENRES, BOOK_CONDITIONS, SELL_PLATFORMS } from "../shared/types";
import type { ScannedBook, BookListing, UserProfile } from "../shared/types";

describe("shared/types constants", () => {
  it("BOOK_GENRES has at least 10 genres", () => {
    expect(BOOK_GENRES.length).toBeGreaterThanOrEqual(10);
  });

  it("BOOK_CONDITIONS has 5 conditions", () => {
    expect(BOOK_CONDITIONS).toHaveLength(5);
    expect(BOOK_CONDITIONS.map((c) => c.value)).toContain("new");
    expect(BOOK_CONDITIONS.map((c) => c.value)).toContain("acceptable");
  });

  it("SELL_PLATFORMS has at least 6 platforms", () => {
    expect(SELL_PLATFORMS.length).toBeGreaterThanOrEqual(6);
    const names = SELL_PLATFORMS.map((p) => p.name);
    expect(names).toContain("Amazon");
    expect(names).toContain("eBay");
  });

  it("SELL_PLATFORMS each have required fields", () => {
    for (const p of SELL_PLATFORMS) {
      expect(p).toHaveProperty("id");
      expect(p).toHaveProperty("name");
      expect(p).toHaveProperty("description");
      expect(p).toHaveProperty("averageFeePercent");
    }
  });
});

// ─── Test ScannedBook type shape ─────────────────────────────────────────────

describe("ScannedBook type", () => {
  it("can create a valid ScannedBook object", () => {
    const book: ScannedBook = {
      id: "test-1",
      isbn: "9780061965487",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      publisher: "Scribner",
      publishedYear: 1925,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9780061965487-L.jpg",
      description: "A classic novel",
      genre: "Fiction",
      prices: [],
      bestPrice: 12.99,
      scannedAt: new Date().toISOString(),
    };
    expect(book.isbn).toBe("9780061965487");
    expect(book.title).toBe("The Great Gatsby");
    expect(book.bestPrice).toBe(12.99);
  });
});

// ─── Test UserProfile type shape ─────────────────────────────────────────────

describe("UserProfile type", () => {
  it("can create a guest user profile", () => {
    const guest: UserProfile = {
      id: "guest",
      name: "Guest",
      username: "guest",
      phone: "",
      isGuest: true,
      createdAt: new Date().toISOString(),
      onboardingComplete: true,
    };
    expect(guest.isGuest).toBe(true);
    expect(guest.onboardingComplete).toBe(true);
  });

  it("can create a full user profile", () => {
    const user: UserProfile = {
      id: "user_123",
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      phone: "+1-555-0100",
      dateOfBirth: "1990-01-15",
      city: "New York",
      country: "United States",
      language: "English",
      isGuest: false,
      createdAt: new Date().toISOString(),
      onboardingComplete: true,
      howFoundApp: "app_store",
      whyUsingApp: "sell_books",
      favoriteGenres: ["Fiction", "Mystery"],
    };
    expect(user.name).toBe("John Doe");
    expect(user.favoriteGenres).toContain("Fiction");
    expect(user.isGuest).toBe(false);
  });
});

// ─── Test BookListing type shape ─────────────────────────────────────────────

describe("BookListing type", () => {
  it("can create a valid BookListing", () => {
    const listing: BookListing = {
      id: "listing-1",
      userId: "user_123",
      userName: "John Doe",
      userPhone: "+1-555-0100",
      isbn: "9780061965487",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      condition: "good",
      price: 8.99,
      description: "Good condition, no markings",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(listing.condition).toBe("good");
    expect(listing.price).toBe(8.99);
    expect(listing.status).toBe("active");
  });
});

// ─── Test formatPrice utility ─────────────────────────────────────────────────

describe("formatPrice utility", () => {
  it("formats prices correctly", () => {
    // Inline test since we can't import from lib in vitest without mocking RN
    const formatPrice = (price: number, currency = "USD") => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    };
    expect(formatPrice(12.99)).toBe("$12.99");
    expect(formatPrice(0)).toBe("$0.00");
    expect(formatPrice(1234.5)).toBe("$1,234.50");
  });
});

// ─── Test ISBN validation logic ───────────────────────────────────────────────

describe("ISBN validation", () => {
  it("identifies valid ISBN-13 format", () => {
    const isValidISBN = (isbn: string) => {
      const cleaned = isbn.replace(/[-\s]/g, "");
      return /^\d{13}$/.test(cleaned) || /^\d{10}$/.test(cleaned);
    };
    expect(isValidISBN("9780061965487")).toBe(true);
    expect(isValidISBN("978-0-06-196548-7")).toBe(true);
    expect(isValidISBN("0061965480")).toBe(true);
    expect(isValidISBN("12345")).toBe(false);
    expect(isValidISBN("not-an-isbn")).toBe(false);
  });
});

// ─── Test price aggregation logic ────────────────────────────────────────────

describe("Price aggregation", () => {
  it("computes total value of selected books", () => {
    const books: Pick<ScannedBook, "bestPrice">[] = [
      { bestPrice: 12.99 },
      { bestPrice: 8.50 },
      { bestPrice: 24.99 },
      { bestPrice: undefined },
    ];
    const total = books.reduce((sum, b) => sum + (b.bestPrice || 0), 0);
    expect(total).toBeCloseTo(46.48, 2);
  });

  it("finds best (highest) price from price list", () => {
    const prices = [
      { platform: "Amazon", price: 12.99, condition: "good" as const },
      { platform: "eBay", price: 8.50, condition: "acceptable" as const },
      { platform: "AbeBooks", price: 18.99, condition: "like_new" as const },
    ];
    const best = prices.reduce((max, p) => p.price > max.price ? p : max, prices[0]);
    expect(best.platform).toBe("AbeBooks");
    expect(best.price).toBe(18.99);
  });
});
