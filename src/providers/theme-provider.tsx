"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = Exclude<Theme, "system">;

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ResolvedTheme, disableTransition: boolean) {
  let transitionStyle: HTMLStyleElement | null = null;
  if (disableTransition) {
    transitionStyle = document.createElement("style");
    transitionStyle.textContent = "*,*::before,*::after{transition:none!important}";
    document.head.appendChild(transitionStyle);
  }

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;

  if (transitionStyle) {
    window.getComputedStyle(document.documentElement);
    transitionStyle.remove();
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setSystemTheme(media.matches ? "dark" : "light");
    updateSystemTheme();
    media.addEventListener("change", updateSystemTheme);
    return () => media.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    let active = true;
    try {
      const savedTheme = window.localStorage.getItem(storageKey) as Theme | null;
      if (savedTheme === "light" || savedTheme === "dark" || (enableSystem && savedTheme === "system")) {
        queueMicrotask(() => {
          if (active) setThemeState(savedTheme);
        });
      }
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
    return () => { active = false; };
  }, [enableSystem, storageKey]);

  useEffect(() => {
    applyTheme(resolvedTheme, disableTransitionOnChange);
  }, [disableTransitionOnChange, resolvedTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    const safeTheme = nextTheme === "system" && !enableSystem ? "light" : nextTheme;
    setThemeState(safeTheme);
    try {
      window.localStorage.setItem(storageKey, safeTheme);
    } catch {
      // The in-memory preference still works for the current page session.
    }
  }, [enableSystem, storageKey]);

  const context = useMemo(() => ({ theme, resolvedTheme, setTheme }), [resolvedTheme, setTheme, theme]);
  return <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme harus digunakan di dalam ThemeProvider.");
  return context;
}
