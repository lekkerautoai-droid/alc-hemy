"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      <div className="mx-auto flex h-24 w-24 animate-paw-bounce items-center justify-center rounded-full bg-gradient-to-br from-[#ff3d9a] via-[#ff7a5c] to-[#ffd166] text-5xl shadow-[0_20px_50px_-12px_rgba(255,61,154,0.55)]">
        🎉
      </div>
      <div>
        <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">You're all set!</h2>
        <p className="mt-2 text-white/70">
          {SITTER} will WhatsApp you shortly to say hi & confirm details.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-left shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/55">
            Booking ref
          </span>
          <span className="rounded-full bg-gradient-to-r from-[#b388ff] to-[#4cc9f0] px-3 py-1 text-xs font-bold text-white">
            {ref}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Detail label="Service" value={`${draft.service.emoji} ${draft.service.name}`} />
          <Detail label="When" value={`${format(dateObj, "EEE, d MMM")} · ${draft.startTime}`} />
          <Detail label="Duration" value={formatDuration(draft.service.duration)} />
          <Detail label="Price" value={formatZAR(draft.service.price)} />
          <Detail label="Address" value={draft.address} className="sm:col-span-2" />
          <Detail label="Pet" value={draft.petDetails} className="sm:col-span-2" />
        </div>

        <div className="mt-6 rounded-2xl border border-[#ffd166]/30 bg-[#ffd166]/10 p-4 text-sm text-[#ffd166]">
          💸 Payment is on the day, in cash or via EFT — no card details needed up front.
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        {wa && (
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#06d6a0] to-[#4cc9f0] text-white shadow-[0_12px_32px_-8px_rgba(6,214,160,0.6)] hover:opacity-95"
          >
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp {SITTER}
            </a>
          </Button>
        )}
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-white/30 bg-white/5 text-white backdrop-blur-md hover:bg-white/10"
        >
          <a href={ics} download={`bells-and-paws-${ref}.ics`}>
            <CalendarPlus className="h-4 w-4" /> Add to calendar
          </a>
        </Button>
        <Button
          asChild
          size="lg"
          variant="ghost"
          className="text-white/75 hover:bg-white/10 hover:text-white"
        >
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
      <div className="text-xs uppercase tracking-wider text-white/50">{label}</div>
      <div className="mt-0.5 font-medium text-white">{value}</div>
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

function buildICSLink(opts: {
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
}) {
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
