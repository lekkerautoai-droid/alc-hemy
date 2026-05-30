import { isAdminAuthed } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingsTable } from "./bookings-table";

export const dynamic = "force-dynamic";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { filter?: string; status?: string };
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const filter = searchParams.filter || "upcoming";
  const status = searchParams.status;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const where: any = {};
  if (filter === "upcoming") where.date = { gte: now };
  if (filter === "past") where.date = { lt: now };
  if (status) where.status = status;

  const bookings = await prisma.booking.findMany({
    where,
    include: { service: true },
    orderBy: filter === "past" ? [{ date: "desc" }, { startTime: "desc" }] : [{ date: "asc" }, { startTime: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Bookings</h1>
        <p className="mt-1 text-muted-foreground">Manage all your bookings here.</p>
      </div>
      <BookingsTable bookings={bookings} initialFilter={filter} initialStatus={status} />
    </div>
  );
}
