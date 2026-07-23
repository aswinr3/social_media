import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export type Theme = "light" | "dark";
const STORAGE_KEY = "connecthub-theme";

// Resolve the startup theme: saved choice wins, otherwise follow the OS.
export const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

// Soft UI toggle: the switch presses into the surface, the knob stays raised.
const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="relative h-[44px] w-[80px] shrink-0 rounded-full bg-theme-input nm-inset cursor-pointer transition-colors duration-300"
    >
      {/* Track icons */}
      <Sun
        size={16}
        className={`absolute left-[13px] top-1/2 -translate-y-1/2 transition-opacity duration-300 ${
          isDark ? "opacity-35 text-theme-text-muted" : "opacity-0"
        }`}
      />
      <Moon
        size={16}
        className={`absolute right-[13px] top-1/2 -translate-y-1/2 transition-opacity duration-300 ${
          isDark ? "opacity-0" : "opacity-35 text-theme-text-muted"
        }`}
      />

      {/* Raised knob */}
      <span
        className={`absolute top-1/2 -translate-y-1/2 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-theme-card nm-raised-sm transition-transform duration-300 ease-out ${
          isDark ? "translate-x-[41px]" : "translate-x-[5px]"
        }`}
      >
        {isDark ? (
          <Moon size={17} className="text-theme-accent" />
        ) : (
          <Sun size={17} className="text-theme-accent" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
