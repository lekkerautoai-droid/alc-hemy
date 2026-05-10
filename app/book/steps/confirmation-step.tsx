"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parse, addMinutes } from "date-fns";
import { CalendarPlus, MessageCircle, Home } from "lucide-react";
import { formatZAR, formatDuration } from "@/lib/utils";
import type { BookingDraft } from "../booking-flow";

interface Props {
  bookingRef: string;
  draft: Required<BookingDraft>;
}

const SITTER = process.env.NEXT_PUBLIC_SITTER_NAME || "Anabel";
const PHONE = process.env.NEXT_PUBLIC_SITTER_PHONE || "";

export function ConfirmationStep({ bookingRef, draft }: Props) {
  const ref = bookingRef;
  const dateObj = parse(draft.date, "yyyy-MM-dd", new Date());
  const startDate = parse(`${draft.date} ${draft.startTime}`, "yyyy-MM-dd HH:mm", new Date());
  const endDate = addMinutes(startDate, draft.service.duration);

  const wa = buildWhatsAppLink(PHONE, ref, draft);
  const ics = buildICSLink({
    title: `🐾 ${draft.service.name} with ${SITTER}`,
    description: `Booking ref: ${ref}\nClient: ${draft.clientName}\nPet: ${draft.petDetails}`,
    location: draft.address,
    start: startDate,
    end: endDate,
  });

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blush-200 to-lavender-200 text-5xl shadow-lg shadow-blush-100 animate-paw-bounce">
        🎉
      </div>
      <div>
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">You're all set!</h2>
        <p className="mt-2 text-muted-foreground">
          {SITTER} will WhatsApp you shortly to say hi & confirm details.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Booking ref</span>
            <Badge variant="lavender">{ref}</Badge>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Detail label="Service" value={`${draft.service.emoji} ${draft.service.name}`} />
            <Detail label="When" value={`${format(dateObj, "EEE, d MMM")} · ${draft.startTime}`} />
            <Detail label="Duration" value={formatDuration(draft.service.duration)} />
            <Detail label="Price" value={formatZAR(draft.service.price)} />
            <Detail label="Address" value={draft.address} className="sm:col-span-2" />
            <Detail label="Pet" value={draft.petDetails} className="sm:col-span-2" />
          </div>

          <div className="mt-6 rounded-2xl bg-cream-100 p-4 text-sm text-amber-900">
            💸 Payment is on the day, in cash or via EFT — no card details needed up front.
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        {wa && (
          <Button asChild size="lg" variant="default">
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp {SITTER}
            </a>
          </Button>
        )}
        <Button asChild size="lg" variant="outline">
          <a href={ics} download={`bells-and-paws-${ref}.ics`}>
            <CalendarPlus className="h-4 w-4" /> Add to calendar
          </a>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="/">
            <Home className="h-4 w-4" /> Done
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Detail({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium text-foreground">{value}</div>
    </div>
  );
}

function buildWhatsAppLink(phone: string, ref: string, draft: Required<BookingDraft>) {
  const number = (phone || "").replace(/\D/g, "");
  if (!number) return null;
  const dateStr = format(parse(draft.date, "yyyy-MM-dd", new Date()), "EEE d MMM");
  const msg = `Hi ${SITTER}! 🐾 I just booked ${draft.service.name} on ${dateStr} at ${draft.startTime}. Booking ref: ${ref}. — ${draft.clientName}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

function buildICSLink(opts: { title: string; description: string; location: string; start: Date; end: Date }) {
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bells and Paws//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@bellsandpaws`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(opts.start)}`,
    `DTEND:${fmt(opts.end)}`,
    `SUMMARY:${escapeICS(opts.title)}`,
    `DESCRIPTION:${escapeICS(opts.description)}`,
    `LOCATION:${escapeICS(opts.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function escapeICS(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
