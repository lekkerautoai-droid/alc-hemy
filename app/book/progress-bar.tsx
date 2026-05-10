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
                  done && "border-blush-400 bg-blush-400 text-white",
                  active && "border-blush-500 bg-white text-blush-500 shadow-md shadow-blush-200",
                  !done && !active && "border-blush-100 bg-white text-muted-foreground"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("h-0.5 flex-1", done ? "bg-blush-300" : "bg-blush-100")} />
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-[11px] font-medium uppercase tracking-wide sm:text-xs",
                active ? "text-blush-500" : "text-muted-foreground"
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
