import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Season = null | "christmas" | "eid" | "valentine" | "spring";

interface ThemeStore {
  theme: "light" | "dark";
  season: Season;
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
  setSeason: (season: Season) => void;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: getSystemTheme(),
      season: null,
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      setTheme: (theme) => set({ theme }),
      setSeason: (season) => set({ season }),
    }),
    {
      name: "pretty-baked-theme",
      // Only persist theme and season, not actions
      partialize: (state) => ({ theme: state.theme, season: state.season }),
    },
  ),
);

/** Apply theme and season classes to <html> */
export function applyTheme(theme: "light" | "dark", season: Season) {
  const root = document.documentElement;

  // Theme class
  root.classList.remove("light", "dark");
  root.classList.add(theme);

  // Season class
  const seasonClasses = [
    "season-christmas",
    "season-eid",
    "season-valentine",
    "season-spring",
  ];
  for (const cls of seasonClasses) {
    root.classList.remove(cls);
  }
  if (season) {
    root.classList.add(`season-${season}`);
  }
}

// ---------------------------------------------------------------------------
// Per-user theme persistence helpers
// User's theme is stored as "pretty-baked-theme-{email}" in localStorage.
// This ensures two different users on the same browser each have their own
// independent theme preference that is loaded on login and saved on toggle.
// ---------------------------------------------------------------------------

const USER_THEME_PREFIX = "pretty-baked-user-theme-";

export function getUserThemeKey(email: string): string {
  return `${USER_THEME_PREFIX}${email}`;
}

/** Load theme for a specific user. Returns null if none saved. */
export function loadUserTheme(email: string): "light" | "dark" | null {
  try {
    const saved = localStorage.getItem(getUserThemeKey(email));
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore
  }
  return null;
}

/** Save theme for a specific user. */
export function saveUserTheme(email: string, theme: "light" | "dark"): void {
  try {
    localStorage.setItem(getUserThemeKey(email), theme);
  } catch {
    // ignore
  }
}
