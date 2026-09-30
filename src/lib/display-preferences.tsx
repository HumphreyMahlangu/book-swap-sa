import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { translate, type TranslationKey, type TranslationVariables } from "@/lib/translations";

export type ThemePreference = "light" | "dark" | "system";

export const SOUTH_AFRICAN_LANGUAGES = [
  { code: "af", label: "Afrikaans" },
  { code: "en", label: "English" },
  { code: "nr", label: "isiNdebele" },
  { code: "xh", label: "isiXhosa" },
  { code: "zu", label: "isiZulu" },
] as const;

export type LanguageCode = (typeof SOUTH_AFRICAN_LANGUAGES)[number]["code"];

interface DisplayPreferencesValue {
  theme: ThemePreference;
  language: LanguageCode;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey, variables?: TranslationVariables) => string;
}

const THEME_KEY = "book-swap-sa-theme";
const LANGUAGE_KEY = "book-swap-sa-language";
const DisplayPreferencesContext = createContext<DisplayPreferencesValue | null>(null);

function applyTheme(theme: ThemePreference) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export function DisplayPreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    const savedLanguage = window.localStorage.getItem(LANGUAGE_KEY);
    const nextTheme =
      savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
        ? savedTheme
        : "system";
    const nextLanguage = SOUTH_AFRICAN_LANGUAGES.some(({ code }) => code === savedLanguage)
      ? (savedLanguage as LanguageCode)
      : "en";
    setThemeState(nextTheme);
    setLanguageState(nextLanguage);
    applyTheme(nextTheme);
    document.documentElement.lang = nextLanguage;
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (nextTheme: ThemePreference) => {
    setThemeState(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage;
  };

  const t = (key: TranslationKey, variables?: TranslationVariables) =>
    translate(language, key, variables);

  return (
    <DisplayPreferencesContext.Provider value={{ theme, language, setTheme, setLanguage, t }}>
      {children}
    </DisplayPreferencesContext.Provider>
  );
}

export function useDisplayPreferences() {
  const context = useContext(DisplayPreferencesContext);
  if (!context)
    throw new Error("useDisplayPreferences must be used inside DisplayPreferencesProvider");
  return context;
}
