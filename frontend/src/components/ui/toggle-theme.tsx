"use client";

import * as React from "react";
import { MonitorCogIcon, MoonStarIcon, SunIcon } from "lucide-react";
import { motion } from "framer-motion";

import { useTheme } from "@/components/shared/ThemeProvider";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { icon: MonitorCogIcon, value: "system" as const, label: "Auto" },
  { icon: SunIcon, value: "light" as const, label: "Light" },
  { icon: MoonStarIcon, value: "dark" as const, label: "Dark" },
];

export function ToggleTheme() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="flex h-8 w-[88px]" aria-hidden />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-muted/70 inline-flex items-center overflow-hidden rounded-full border border-border/60 backdrop-blur-md"
      role="radiogroup"
      aria-label="Theme"
    >
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "relative flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors",
            theme === option.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          role="radio"
          aria-checked={theme === option.value}
          aria-label={`Switch to ${option.label} theme`}
          onClick={() => setTheme(option.value)}
        >
          {theme === option.value && (
            <motion.span
              layoutId="theme-pill"
              transition={{ type: "spring", bounce: 0.18, duration: 0.6 }}
              className="absolute inset-0 rounded-full border border-foreground/15 bg-background shadow-sm"
            />
          )}
          <option.icon className="relative z-10 size-3.5" strokeWidth={1.75} />
        </button>
      ))}
    </motion.div>
  );
}
