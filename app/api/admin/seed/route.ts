import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SERVICES = [
  { id: "seed-1", name: "30-min Dog Walk",      description: "A brisk neighbourhood stroll to burn off zoomies.",        duration: 30,  price: 80,  emoji: "🐕", sortOrder: 1 },
  { id: "seed-2", name: "60-min Dog Walk",      description: "A proper adventure walk with sniff breaks and treats.",     duration: 60,  price: 140, emoji: "🦮", sortOrder: 2 },
  { id: "seed-3", name: "Drop-in Pet Visit",    description: "A 45-min visit: feed, fresh water, cuddles & playtime.",    duration: 45,  price: 100, emoji: "🐾", sortOrder: 3 },
  { id: "seed-4", name: "Half-day Pet Sitting", description: "4 hours of company, walks and pampering at home.",          duration: 240, price: 250, emoji: "🏠", sortOrder: 4 },
  { id: "seed-5", name: "Full-day Pet Sitting", description: "8 full hours of dedicated love and care.",                  duration: 480, price: 450, emoji: "🌞", sortOrder: 5 },
];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-seed-secret");
  if (secret !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }

  for (const day of [1, 2, 3, 4, 5]) {
    await prisma.availabilityRule.upsert({
      where: { id: `wd-${day}` },
      update: {},
      create: { id: `wd-${day}`, dayOfWeek: day, startTime: "15:00", endTime: "18:00", slotInterval: 30 },
    });
  }
  for (const day of [0, 6]) {
    await prisma.availabilityRule.upsert({
      where: { id: `we-${day}` },
      update: {},
      create: { id: `we-${day}`, dayOfWeek: day, startTime: "08:00", endTime: "17:00", slotInterval: 30 },
    });
  }

  const services = await prisma.service.count();
  const rules = await prisma.availabilityRule.count();
  return NextResponse.json({ ok: true, services, rules });
}
