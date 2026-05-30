"use client";

import { formatZAR, formatDuration, cn } from "@/lib/utils";
import { Clock, ArrowRight } from "lucide-react";
import type { ServiceLite } from "../booking-flow";

interface Props {
  services: ServiceLite[];
  selectedId?: string;
  onSelect: (s: ServiceLite) => void;
}

export function ServiceStep({ services, selectedId, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-white">
        What does your pet need today?
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {services.map((s) => {
          const selected = s.id === selectedId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s)}
              className={cn(
                "group rounded-3xl border bg-white/[0.06] p-5 text-left text-white shadow-xl backdrop-blur-xl transition-all",
                "hover:-translate-y-0.5 hover:bg-white/[0.1] hover:shadow-[0_18px_40px_-12px_rgba(255,61,154,0.4)]",
                selected
                  ? "border-[#ff3d9a]/70 ring-2 ring-[#ff3d9a]/40"
                  : "border-white/10",
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff3d9a]/20 via-[#b388ff]/20 to-[#4cc9f0]/20 text-3xl">
                  {s.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold leading-tight">{s.name}</h3>
                    <span className="shrink-0 text-base font-semibold text-[#ffd166]">
                      {formatZAR(s.price)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-white/65">{s.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-white/55">
                      <Clock className="h-3 w-3" /> {formatDuration(s.duration)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#ff3d9a] opacity-0 transition-opacity group-hover:opacity-100">
                      Choose <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
