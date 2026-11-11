import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import en from "./en.json"
import my from "./my.json"

export type Locale = "en" | "my"
type TranslationKey = keyof typeof en
type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey | string, values?: Record<string, string | number>) => string
}

const translations: Record<Locale, Record<string, string>> = { en, my }
const I18nContext = createContext<I18nContextValue | null>(null)

function readLocale(): Locale {
  try {
    return localStorage.getItem("archer.language") === "my" ? "my" : "en"
  } catch {
    return "en"
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale)
  const setLocale = (next: Locale) => {
    setLocaleState(next)
    try { localStorage.setItem("archer.language", next) } catch { /* storage may be disabled */ }
  }

  useEffect(() => {
    document.documentElement.lang = locale === "my" ? "my-MM" : "en"
    document.title = locale === "my" ? "Archer — အလုပ်နှင့် အခွင့်အလမ်းများ" : "Archer — Work, made more human"
  }, [locale])

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key, values = {}) => Object.entries(values).reduce(
      (text, [name, replacement]) => text.replaceAll(`{{${name}}}`, String(replacement)),
      translations[locale][key] ?? key,
    ),
  }), [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error("useI18n must be used inside I18nProvider")
  return context
}

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()
  return <label className="inline-flex items-center">
    <span className="sr-only">{t("Language")}</span>
    <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={t("Language")} className="h-9 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/25">
      <option value="en">English</option>
      <option value="my">မြန်မာ</option>
    </select>
  </label>
}
