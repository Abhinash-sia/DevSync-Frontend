import { useEffect, useState } from "react"

const STORAGE_KEY = "ds-theme"
const DARK = "dark"
const LIGHT = "light"

function getInitialTheme() {
  if (typeof window === "undefined") return DARK
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === LIGHT || stored === DARK) return stored
  // Respect OS preference on first visit
  return window.matchMedia("(prefers-color-scheme: light)").matches ? LIGHT : DARK
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === DARK ? LIGHT : DARK))

  return { theme, toggleTheme, isDark: theme === DARK }
}
