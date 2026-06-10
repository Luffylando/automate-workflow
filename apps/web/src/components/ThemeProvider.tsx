"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  applyThemeClass,
  persistTheme,
  readStoredTheme,
  resolveTheme,
  type ResolvedTheme,
  type Theme,
} from "@/lib/theme";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialThemeState(): {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
} {
  // Keep SSR and the first client render identical. ThemeScript applies the
  // stored theme to <html> before hydration; sync React state in useLayoutEffect.
  return { theme: "system", resolvedTheme: "light" };
}

function useHtmlThemeSync(resolvedTheme: ResolvedTheme) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const isDark = resolvedTheme === "dark";

    const syncClass = () => {
      html.classList.toggle("dark", isDark);
    };

    syncClass();

    const observer = new MutationObserver(() => {
      if (html.classList.contains("dark") !== isDark) {
        syncClass();
      }
    });

    observer.observe(html, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, [resolvedTheme]);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => getInitialThemeState().theme,
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(
    () => getInitialThemeState().resolvedTheme,
  );

  useHtmlThemeSync(resolvedTheme);

  const setTheme = useCallback((nextTheme: Theme) => {
    const resolved = resolveTheme(nextTheme);
    setThemeState(nextTheme);
    setResolvedTheme(resolved);
    applyThemeClass(resolved);
    persistTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useLayoutEffect(() => {
    const storedTheme = readStoredTheme();
    const resolved = resolveTheme(storedTheme);
    setThemeState(storedTheme);
    setResolvedTheme(resolved);
    applyThemeClass(resolved);
  }, []);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const resolved = resolveTheme("system");
      setResolvedTheme(resolved);
      applyThemeClass(resolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}

export type { Theme, ResolvedTheme };
