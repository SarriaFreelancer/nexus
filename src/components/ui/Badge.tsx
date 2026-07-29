import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "indigo" | "blue" | "emerald" | "amber" | "rose" | "purple" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "indigo",
  size = "sm",
  className,
}) => {
    const variantStyles = {
      indigo: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50",
      blue: "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
      emerald: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
      amber: "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
      rose: "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50",
      purple: "bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50",
      neutral: "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700/50",
    };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium rounded-md border",
    md: "px-2.5 py-1 text-xs font-semibold rounded-lg border",
  };

  return (
    <span className={cn(sizeStyles[size], variantStyles[variant], "inline-flex items-center gap-1", className)}>
      {children}
    </span>
  );
};
