"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith("/dashboard");

  useEffect(() => {
    setMounted(true);
    // On mount, check if there's a theme in localStorage or if system prefers dark
    const storedTheme = localStorage.getItem("webtoko_theme");
    const initialTheme = storedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    // Apply theme based on route
    if (isDashboard) {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [theme, isDashboard]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("webtoko_theme", newTheme);
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
        var isDashboard = window.location.pathname.startsWith('/dashboard');
        if (!isDashboard) {
          document.documentElement.setAttribute("data-theme", "light");
        } else {
          var storedTheme = localStorage.getItem("webtoko_theme");
          if (storedTheme) {
            document.documentElement.setAttribute("data-theme", storedTheme);
          } else {
            var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
          }
        }
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />;
};
