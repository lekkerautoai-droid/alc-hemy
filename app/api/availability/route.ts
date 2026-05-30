import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, getAvailabilityMap } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date"); // yyyy-MM-dd
  const days = searchParams.get("days");

  if (!serviceId) {
    return NextResponse.json({ error: "serviceId required" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return NextResponse.json({ error: "service not found" }, { status: 404 });

  if (date) {
    const slots = await getAvailableSlots(date, service.duration);
    return NextResponse.json({ slots });
  }

  const map = await getAvailabilityMap(days ? Number(days) : 21, service.duration);
  return NextResponse.json({ map });
}
