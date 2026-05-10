"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-blush-500">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{format(dateObj, "EEE, d MMM")}</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <h2 className="font-display text-2xl font-semibold">Choose a time</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {service.emoji} {service.name} · {formatDuration(service.duration)}
          </p>

          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : slots.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-cream-100 p-4 text-center text-sm text-amber-800">
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
                      ? "border-blush-100 bg-white hover:-translate-y-0.5 hover:border-blush-300 hover:shadow-md"
                      : "cursor-not-allowed border-transparent bg-muted/40 text-muted-foreground line-through opacity-60",
                    selectedTime === s.startTime && "border-blush-500 bg-blush-50 text-blush-500 shadow-md"
                  )}
                >
                  {s.startTime}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
