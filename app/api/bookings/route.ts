import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateBookingRef, isValidSAPhone, normalizeSAPhone } from "@/lib/utils";
import { getAvailableSlots, formatDayLong, formatTimeRange, toDateOnly } from "@/lib/booking";
import { sendBookingEmails } from "@/lib/email";

const bookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  clientName: z.string().min(2).max(80),
  clientPhone: z.string().refine(isValidSAPhone, "Invalid SA phone number"),
  clientEmail: z.string().email(),
  address: z.string().min(5).max(200),
  petDetails: z.string().min(2).max(300),
  notes: z.string().max(800).optional().nullable(),
});

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "Service not available" }, { status: 400 });
  }

  // Re-check availability server-side to prevent race conditions / tampering
  const slots = await getAvailableSlots(data.date, service.duration);
  const slot = slots.find((s) => s.startTime === data.startTime);
  if (!slot || !slot.available) {
    return NextResponse.json({ error: "That time is no longer available" }, { status: 409 });
  }

  const ref = generateBookingRef();
  const dateOnly = toDateOnly(data.date);

  const booking = await prisma.booking.create({
    data: {
      ref,
      serviceId: service.id,
      date: dateOnly,
      startTime: data.startTime,
      clientName: data.clientName.trim(),
      clientPhone: normalizeSAPhone(data.clientPhone),
      clientEmail: data.clientEmail.trim().toLowerCase(),
      address: data.address.trim(),
      petDetails: data.petDetails.trim(),
      notes: data.notes?.trim() || null,
      status: "CONFIRMED",
    },
    include: { service: true },
  });

  // Fire-and-forget emails
  sendBookingEmails({
    ref: booking.ref,
    serviceName: booking.service.name,
    emoji: booking.service.emoji,
    date: formatDayLong(booking.date),
    timeRange: formatTimeRange(booking.startTime, booking.service.duration),
    price: booking.service.price,
    clientName: booking.clientName,
    clientPhone: booking.clientPhone,
    clientEmail: booking.clientEmail,
    address: booking.address,
    petDetails: booking.petDetails,
    notes: booking.notes,
  }).catch(() => undefined);

  return NextResponse.json({ ok: true, ref: booking.ref });
}
