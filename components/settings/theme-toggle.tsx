"use client";

import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {theme === "dark" ? (
          <Moon className="size-4 text-muted-foreground" />
        ) : (
          <Sun className="size-4 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">Dark mode</p>
          <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
        </div>
      </div>
      <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
    </div>
  );
}
