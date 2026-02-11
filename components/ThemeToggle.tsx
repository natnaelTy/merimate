"use client";
import { useTheme } from "next-themes";
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";


export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && resolvedTheme === "dark");
  
  return (
      <ThemeSwitcher
      onChange={(value) => setTheme(value)}
    />
  );
}