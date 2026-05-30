import { addMinutes, format, parse } from "date-fns";
import { prisma } from "./prisma";

export interface TimeSlot {
  startTime: string;     // "HH:mm"
  endTime: string;       // "HH:mm"
  available: boolean;
}

/** Convert an ISO date (yyyy-MM-dd) to a UTC midnight Date for storage/lookup. */
export function toDateOnly(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function dayOfWeek(date: Date): number {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).getDay();
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min: number) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Compute available time slots for a given date and service duration.
 * A slot is available if:
 *   - the slot+duration fits inside an availability rule for that weekday
 *   - the date isn't in BlockedDate
 *   - no existing CONFIRMED booking overlaps it
 */
export async function getAvailableSlots(isoDate: string, serviceDuration: number): Promise<TimeSlot[]> {
  const date = toDateOnly(isoDate);

  // Past dates → no slots
  const todayUTC = toDateOnly(format(new Date(), "yyyy-MM-dd"));
  if (date < todayUTC) return [];

  const blocked = await prisma.blockedDate.findUnique({ where: { date } });
  if (blocked) return [];

  const weekday = dayOfWeek(date);
  const rules = await prisma.availabilityRule.findMany({
    where: { dayOfWeek: weekday, active: true },
  });
  if (rules.length === 0) return [];

  const existing = await prisma.booking.findMany({
    where: { date, status: { in: ["CONFIRMED", "COMPLETED"] } },
    include: { service: true },
  });

  const slots: TimeSlot[] = [];
  for (const rule of rules) {
    const start = timeToMinutes(rule.startTime);
    const end = timeToMinutes(rule.endTime);
    for (let t = start; t + serviceDuration <= end; t += rule.slotInterval) {
      const slotStart = t;
      const slotEnd = t + serviceDuration;

      const conflict = existing.some((b) => {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = bStart + b.service.duration;
        return slotStart < bEnd && bStart < slotEnd;
      });

      slots.push({
        startTime: minutesToTime(slotStart),
        endTime: minutesToTime(slotEnd),
        available: !conflict,
      });
    }
  }

  // Filter out past slots if booking for today
  const now = new Date();
  const isToday = format(now, "yyyy-MM-dd") === isoDate;
  if (isToday) {
    const nowMin = now.getHours() * 60 + now.getMinutes() + 30; // 30-min buffer
    return slots.filter((s) => timeToMinutes(s.startTime) >= nowMin);
  }

  return slots;
}

/**
 * Get a quick "has-availability" map for the next N days, for the date picker.
 *
 * Optimized: instead of N sequential queries we fetch all rules / blocks /
 * bookings once and compute the map in-memory.
 */
export async function getAvailabilityMap(days: number, serviceDuration: number) {
  const today = new Date();
  const todayISO = format(today, "yyyy-MM-dd");
  const todayStart = toDateOnly(todayISO);
  const endDate = new Date(todayStart);
  endDate.setUTCDate(endDate.getUTCDate() + days);

  const [rules, blocks, bookings] = await Promise.all([
    prisma.availabilityRule.findMany({ where: { active: true } }),
    prisma.blockedDate.findMany({ where: { date: { gte: todayStart, lte: endDate } } }),
    prisma.booking.findMany({
      where: {
        date: { gte: todayStart, lte: endDate },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      include: { service: true },
    }),
  ]);

  const blockedSet = new Set(blocks.map((b) => format(b.date, "yyyy-MM-dd")));
  const rulesByDay = new Map<number, typeof rules>();
  for (const r of rules) {
    const arr = rulesByDay.get(r.dayOfWeek) ?? [];
    arr.push(r);
    rulesByDay.set(r.dayOfWeek, arr);
  }

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes() + 30;

  const timeToMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const map: Record<string, boolean> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(todayStart);
    d.setUTCDate(d.getUTCDate() + i);
    const iso = format(d, "yyyy-MM-dd");

    if (blockedSet.has(iso)) {
      map[iso] = false;
      continue;
    }
    const weekday = dayOfWeek(d);
    const dayRules = rulesByDay.get(weekday) ?? [];
    if (dayRules.length === 0) {
      map[iso] = false;
      continue;
    }

    const dayBookings = bookings.filter((b) => format(b.date, "yyyy-MM-dd") === iso);
    const isToday = iso === todayISO;

    let hasOpenSlot = false;
    outer: for (const rule of dayRules) {
      const start = timeToMin(rule.startTime);
      const end = timeToMin(rule.endTime);
      for (let t = start; t + serviceDuration <= end; t += rule.slotInterval) {
        if (isToday && t < nowMin) continue;
        const slotStart = t;
        const slotEnd = t + serviceDuration;
        const conflict = dayBookings.some((b) => {
          const bStart = timeToMin(b.startTime);
          const bEnd = bStart + b.service.duration;
          return slotStart < bEnd && bStart < slotEnd;
        });
        if (!conflict) {
          hasOpenSlot = true;
          break outer;
        }
      }
    }
    map[iso] = hasOpenSlot;
  }

  return map;
}

export function formatDayLong(d: Date) {
  return format(d, "EEEE, d MMMM yyyy");
}

export function formatTimeRange(start: string, durationMin: number) {
  const startDate = parse(start, "HH:mm", new Date());
  const endDate = addMinutes(startDate, durationMin);
  return `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`;
}
