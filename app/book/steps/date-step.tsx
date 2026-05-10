"use client";

import { useEffect, useState } from "react";
import { GlassCalendar } from "@/components/ui/glass-calendar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { addDays, parse } from "date-fns";
import type { ServiceLite } from "../booking-flow";

interface Props {
  service: ServiceLite;
  selectedDate?: string; // yyyy-MM-dd
  onBack: () => void;
  onSelect: (date: string) => void;
}

export function DateStep({ service, selectedDate, onBack, onSelect }: Props) {
  const [map, setMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/availability?serviceId=${service.id}&days=42`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setMap(data.map || {});
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [service.id]);

  const selected = selectedDate ? parse(selectedDate, "yyyy-MM-dd", new Date()) : undefined;
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);
  const maxDate = addDays(minDate, 42);

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
          <span className="font-medium text-white">
            {service.emoji} {service.name}
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        {loading ? (
          <div className="flex h-72 w-full max-w-[420px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl">
            <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          </div>
        ) : (
          <GlassCalendar
            selectedDate={selected}
            onDateSelect={(d) => {
              const iso = d.toISOString().slice(0, 10);
              onSelect(iso);
            }}
            availabilityMap={map}
            minDate={minDate}
            footerLeft={
              <span>
                {service.emoji} {service.name}
              </span>
            }
          />
        )}
      </div>

      {!loading && Object.values(map).every((v) => !v) && (
        <p className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-center text-sm text-white/75 backdrop-blur-xl">
          No availability in the next 6 weeks. Please check back soon!
        </p>
      )}

      <p className="text-center text-xs text-white/45">
        Tap a highlighted day. Greyed-out days are unavailable.
      </p>
    </div>
  );
}
