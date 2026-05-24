import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { ScannedBook, UserProfile, BookListing, BuyerInquiry } from "@/shared/types";

// ─── State ───────────────────────────────────────────────────────────────────

export interface AppState {
  scannedBooks: ScannedBook[];
  listings: BookListing[];
  userProfile: UserProfile | null;
  notifications: BuyerInquiry[];
  unreadNotificationCount: number;
  onboardingComplete: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
}

const initialState: AppState = {
  scannedBooks: [],
  listings: [],
  userProfile: null,
  notifications: [],
  unreadNotificationCount: 0,
  onboardingComplete: false,
  isGuest: false,
  isAuthenticated: false,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export type AppAction =
  | { type: "ADD_SCANNED_BOOK"; book: ScannedBook }
  | { type: "REMOVE_SCANNED_BOOK"; isbn: string }
  | { type: "TOGGLE_BOOK_SELECTED"; isbn: string }
  | { type: "CLEAR_BOOK_SELECTIONS" }
  | { type: "ADD_LISTING"; listing: BookListing }
  | { type: "UPDATE_LISTING"; listing: BookListing }
  | { type: "REMOVE_LISTING"; id: string }
  | { type: "SET_USER_PROFILE"; profile: UserProfile }
  | { type: "UPDATE_USER_PROFILE"; updates: Partial<UserProfile> }
  | { type: "SET_GUEST_MODE" }
  | { type: "SET_ONBOARDING_COMPLETE"; complete: boolean }
  | { type: "ADD_NOTIFICATION"; notification: BuyerInquiry }
  | { type: "MARK_NOTIFICATION_READ"; id: string }
  | { type: "SIGN_OUT" }
  | { type: "LOAD_STATE"; state: Partial<AppState> };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_SCANNED_BOOK": {
      const exists = state.scannedBooks.find((b) => b.isbn === action.book.isbn);
      if (exists) return state;
      return { ...state, scannedBooks: [action.book, ...state.scannedBooks] };
    }
    case "REMOVE_SCANNED_BOOK":
      return { ...state, scannedBooks: state.scannedBooks.filter((b) => b.isbn !== action.isbn) };
    case "TOGGLE_BOOK_SELECTED":
      return {
        ...state,
        scannedBooks: state.scannedBooks.map((b) =>
          b.isbn === action.isbn ? { ...b, isSelected: !b.isSelected } : b
        ),
      };
    case "CLEAR_BOOK_SELECTIONS":
      return { ...state, scannedBooks: state.scannedBooks.map((b) => ({ ...b, isSelected: false })) };
    case "ADD_LISTING":
      return { ...state, listings: [action.listing, ...state.listings] };
    case "UPDATE_LISTING":
      return { ...state, listings: state.listings.map((l) => (l.id === action.listing.id ? action.listing : l)) };
    case "REMOVE_LISTING":
      return { ...state, listings: state.listings.filter((l) => l.id !== action.id) };
    case "SET_USER_PROFILE":
      return {
        ...state,
        userProfile: action.profile,
        isGuest: action.profile.isGuest,
        isAuthenticated: true,
      };
    case "UPDATE_USER_PROFILE":
      return {
        ...state,
        userProfile: state.userProfile ? { ...state.userProfile, ...action.updates } : null,
      };
    case "SET_GUEST_MODE":
      return {
        ...state,
        isGuest: true,
        isAuthenticated: true,
        onboardingComplete: true,
        userProfile: {
          id: "guest",
          name: "Guest",
          username: "guest",
          phone: "",
          isGuest: true,
          createdAt: new Date().toISOString(),
          onboardingComplete: true,
        },
      };
    case "SET_ONBOARDING_COMPLETE":
      return {
        ...state,
        onboardingComplete: action.complete,
        userProfile: state.userProfile
          ? { ...state.userProfile, onboardingComplete: action.complete }
          : null,
      };
    case "ADD_NOTIFICATION": {
      const updated = [action.notification, ...state.notifications];
      return {
        ...state,
        notifications: updated,
        unreadNotificationCount: updated.filter((n) => !n.isRead).length,
      };
    }
    case "MARK_NOTIFICATION_READ": {
      const updated = state.notifications.map((n) => (n.id === action.id ? { ...n, isRead: true } : n));
      return {
        ...state,
        notifications: updated,
        unreadNotificationCount: updated.filter((n) => !n.isRead).length,
      };
    }
    case "SIGN_OUT":
      return {
        ...initialState,
        scannedBooks: state.scannedBooks,
      };
    case "LOAD_STATE":
      return { ...state, ...action.state };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue>({
  state: initialState,
  dispatch: () => {},
});

const STORAGE_KEY = "@bookscan_state_v2";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const saved = JSON.parse(raw) as Partial<AppState>;
            dispatch({ type: "LOAD_STATE", state: saved });
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const toSave: Partial<AppState> = {
      scannedBooks: state.scannedBooks,
      listings: state.listings,
      userProfile: state.userProfile,
      notifications: state.notifications,
      unreadNotificationCount: state.unreadNotificationCount,
      onboardingComplete: state.onboardingComplete,
      isGuest: state.isGuest,
      isAuthenticated: state.isAuthenticated,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
  }, [state]);

  return React.createElement(AppContext.Provider, { value: { state, dispatch } }, children);
}

export function useAppStore() {
  return useContext(AppContext);
}
