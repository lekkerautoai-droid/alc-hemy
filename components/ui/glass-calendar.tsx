"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  getDate,
  getDaysInMonth,
  startOfMonth,
  isSameMonth,
} from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Day {
  date: Date;
  iso: string;
  isToday: boolean;
  isSelected: boolean;
  isAvailable: boolean;
  isPast: boolean;
}

interface GlassCalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  /** Map of yyyy-MM-dd → has availability. Days not in the map are treated as unavailable. */
  availabilityMap?: Record<string, boolean>;
  /** Hide days before this date. Defaults to today. */
  minDate?: Date;
  /** Optional caption shown in the footer slot — e.g. selected service name. */
  footerLeft?: React.ReactNode;
  /** Optional CTA shown at the right of the footer — e.g. "Continue". */
  footerRight?: React.ReactNode;
  className?: string;
}

export const GlassCalendar = React.forwardRef<HTMLDivElement, GlassCalendarProps>(
  (
    {
      className,
      selectedDate: propSelectedDate,
      onDateSelect,
      availabilityMap,
      minDate,
      footerLeft,
      footerRight,
      ...props
    },
    ref,
  ) => {
    const today = React.useMemo(() => {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      return t;
    }, []);
    const min = minDate ?? today;

    const [currentMonth, setCurrentMonth] = React.useState(propSelectedDate ?? today);
    const selected = propSelectedDate;

    // Auto-scroll today into view on mount
    const scrollerRef = React.useRef<HTMLDivElement>(null);
    const todayBtnRef = React.useRef<HTMLButtonElement>(null);
    const selectedBtnRef = React.useRef<HTMLButtonElement>(null);
    React.useEffect(() => {
      const btn = selectedBtnRef.current ?? todayBtnRef.current;
      if (btn && scrollerRef.current) {
        const scroller = scrollerRef.current;
        const offset = btn.offsetLeft - scroller.clientWidth / 2 + btn.clientWidth / 2;
        scroller.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
      }
    }, [currentMonth, selected]);

    const monthDays = React.useMemo<Day[]>(() => {
      const start = startOfMonth(currentMonth);
      const total = getDaysInMonth(currentMonth);
      const days: Day[] = [];
      for (let i = 0; i < total; i++) {
        const date = new Date(start.getFullYear(), start.getMonth(), i + 1);
        const iso = format(date, "yyyy-MM-dd");
        days.push({
          date,
          iso,
          isToday: isToday(date),
          isSelected: selected ? isSameDay(date, selected) : false,
          isAvailable: availabilityMap ? !!availabilityMap[iso] : date >= min,
          isPast: date < min,
        });
      }
      return days;
    }, [currentMonth, selected, availabilityMap, min]);

    const handleDateClick = (day: Day) => {
      if (day.isPast || !day.isAvailable) return;
      onDateSelect?.(day.date);
    };

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const canPrev = !isSameMonth(currentMonth, today) && currentMonth > today;

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-[420px] rounded-3xl p-5 shadow-2xl overflow-hidden",
          "bg-white/[0.07] backdrop-blur-2xl border border-white/15",
          "text-white font-sans",
          "shadow-[0_20px_60px_-15px_rgba(255,61,154,0.35)]",
          className,
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Pick a day
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canPrev}
              className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Month label */}
        <div className="my-5 flex items-baseline gap-2">
          <motion.span
            key={format(currentMonth, "MMMM yyyy")}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="font-display text-4xl font-semibold tracking-tight"
          >
            {format(currentMonth, "MMMM")}
          </motion.span>
          <span className="text-lg text-white/50">{format(currentMonth, "yyyy")}</span>
        </div>

        {/* Day strip */}
        <div ref={scrollerRef} className="-mx-5 overflow-x-auto px-5 scrollbar-hide">
          <div className="flex gap-3.5 pb-2">
            {monthDays.map((day) => {
              const isClickable = !day.isPast && day.isAvailable;
              const ref =
                day.isSelected
                  ? selectedBtnRef
                  : day.isToday
                    ? todayBtnRef
                    : undefined;
              return (
                <div
                  key={day.iso}
                  className="flex flex-shrink-0 flex-col items-center gap-2"
                >
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      day.isSelected ? "text-white" : "text-white/45",
                    )}
                  >
                    {format(day.date, "EEE")}
                  </span>
                  <button
                    ref={ref}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={!isClickable}
                    className={cn(
                      "relative flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold transition-all duration-200",
                      day.isSelected &&
                        "bg-gradient-to-br from-[#ff3d9a] via-[#ff7a5c] to-[#ffd166] text-white shadow-[0_8px_24px_-4px_rgba(255,61,154,0.6)]",
                      !day.isSelected && isClickable && "text-white hover:bg-white/15",
                      !isClickable && "cursor-not-allowed text-white/25",
                    )}
                  >
                    {day.isToday && !day.isSelected && (
                      <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-[#ff3d9a]" />
                    )}
                    {getDate(day.date)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider + footer */}
        {(footerLeft || footerRight) && (
          <>
            <div className="mt-5 h-px bg-white/15" />
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 truncate text-sm text-white/75">
                {footerLeft}
              </div>
              <div className="flex-shrink-0">{footerRight}</div>
            </div>
          </>
        )}
      </div>
    );
  },
);
GlassCalendar.displayName = "GlassCalendar";
