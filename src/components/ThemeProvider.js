"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // On mount, check if there's a theme in localStorage or if system prefers dark
    const storedTheme = localStorage.getItem("webtoko_theme");
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute("data-theme", storedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("webtoko_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Prevent rendering children until mounted to avoid FOUC mismatch between server and client
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Script to inject in <head> to prevent FOUC
export const ThemeScript = () => {
  const codeToRunOnClient = `
    (function() {
      try {
        var storedTheme = localStorage.getItem("webtoko_theme");
        if (storedTheme) {
          document.documentElement.setAttribute("data-theme", storedTheme);
        } else {
          var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
        }
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />;
};
