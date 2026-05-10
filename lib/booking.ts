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

/** Get a quick "has-availability" map for the next N days, for the date picker. */
export async function getAvailabilityMap(days: number, serviceDuration: number) {
  const today = new Date();
  const map: Record<string, boolean> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = format(d, "yyyy-MM-dd");
    const slots = await getAvailableSlots(iso, serviceDuration);
    map[iso] = slots.some((s) => s.available);
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
