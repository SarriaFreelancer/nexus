import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = "bg-indigo-500",
  className,
  showLabel = false,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full flex items-center gap-2", className)}>
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-slate-700/30">
        <div
          className={cn("h-full transition-all duration-500 rounded-full", color)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-400 min-w-[32px] text-right">
          {clampedValue}%
        </span>
      )}
    </div>
  );
};
