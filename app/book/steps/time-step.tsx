"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { format, parse } from "date-fns";
import { cn, formatDuration } from "@/lib/utils";
import type { ServiceLite } from "../booking-flow";

interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface Props {
  service: ServiceLite;
  date: string;
  selectedTime?: string;
  onBack: () => void;
  onSelect: (time: string) => void;
}

export function TimeStep({ service, date, selectedTime, onBack, onSelect }: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/availability?serviceId=${service.id}&date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setSlots(data.slots || []);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [service.id, date]);

  const dateObj = parse(date, "yyyy-MM-dd", new Date());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-white/65 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="text-sm text-white/65">
          <span className="font-medium text-white">{format(dateObj, "EEE, d MMM")}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl backdrop-blur-xl sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-white">Choose a time</h2>
        <p className="mt-1 text-sm text-white/65">
          {service.emoji} {service.name} · {formatDuration(service.duration)}
        </p>

        {loading ? (
          <div className="flex h-48 items-center justify-center text-white/60">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : slots.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-center text-sm text-white/75">
            No available times that day. Try another date.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => (
              <button
                key={s.startTime}
                disabled={!s.available}
                onClick={() => onSelect(s.startTime)}
                className={cn(
                  "rounded-2xl border-2 px-3 py-3 text-sm font-medium transition-all",
                  s.available
                    ? "border-white/15 bg-white/5 text-white hover:-translate-y-0.5 hover:border-[#ff3d9a]/60 hover:bg-white/10"
                    : "cursor-not-allowed border-transparent bg-white/[0.03] text-white/30 line-through",
                  selectedTime === s.startTime &&
                    "border-transparent bg-gradient-to-br from-[#ff3d9a] via-[#ff7a5c] to-[#ffd166] text-white shadow-[0_8px_24px_-4px_rgba(255,61,154,0.6)]",
                )}
              >
                {s.startTime}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
