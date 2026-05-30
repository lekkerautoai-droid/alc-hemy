"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function ProgressBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center justify-between gap-2 px-2">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all",
                  done && "border-transparent bg-gradient-to-br from-[#ff3d9a] to-[#ff7a5c] text-white shadow-[0_6px_18px_-4px_rgba(255,61,154,0.6)]",
                  active && "border-[#ff3d9a] bg-[#0a0717] text-[#ff3d9a] shadow-[0_0_0_4px_rgba(255,61,154,0.15)]",
                  !done && !active && "border-white/15 bg-white/5 text-white/50",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1",
                    done ? "bg-gradient-to-r from-[#ff3d9a] to-[#ff7a5c]" : "bg-white/10",
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-[11px] font-medium uppercase tracking-wide sm:text-xs",
                active ? "text-white" : "text-white/50",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
