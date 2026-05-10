import Link from "next/link";
import { isAdminAuthed } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { formatZAR } from "@/lib/utils";
import { CalendarRange, Coins, Repeat2, Sparkles } from "lucide-react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [bookingsThisWeek, bookingsThisMonth, all, upcoming] = await Promise.all([
    prisma.booking.count({
      where: { date: { gte: weekStart, lte: weekEnd }, status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
    prisma.booking.findMany({
      where: { date: { gte: monthStart, lte: monthEnd }, status: { in: ["CONFIRMED", "COMPLETED"] } },
      include: { service: true },
    }),
    prisma.booking.findMany({ select: { clientEmail: true } }),
    prisma.booking.findMany({
      where: { date: { gte: now }, status: "CONFIRMED" },
      include: { service: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 5,
    }),
  ]);

  const monthRevenue = bookingsThisMonth.reduce((sum, b) => sum + b.service.price, 0);
  const repeatClients = countRepeats(all.map((b) => b.clientEmail));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Hi {process.env.NEXT_PUBLIC_SITTER_NAME?.split(" ")[0] || "there"} 🌷</h1>
        <p className="mt-1 text-muted-foreground">Here's what's happening this week.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Bookings this week" value={bookingsThisWeek.toString()} icon={<CalendarRange />} variant="blush" />
        <StatCard label="Bookings this month" value={bookingsThisMonth.length.toString()} icon={<CalendarRange />} variant="lavender" />
        <StatCard label="Revenue this month" value={formatZAR(monthRevenue)} icon={<Coins />} variant="sage" />
        <StatCard label="Repeat clients" value={repeatClients.toString()} icon={<Repeat2 />} variant="cream" />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Next up</h2>
            <Link href="/admin/bookings" className="text-sm text-blush-500 hover:underline">View all →</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="rounded-2xl bg-cream-50 p-6 text-center text-muted-foreground">
              <Sparkles className="mx-auto mb-2 h-6 w-6 text-blush-400" />
              No upcoming bookings yet. Once someone books, they'll show up here.
            </div>
          ) : (
            <ul className="divide-y divide-blush-50">
              {upcoming.map((b) => (
                <li key={b.id} className="flex items-center gap-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blush-50 text-lg">
                    {b.service.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{b.clientName} · {b.service.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {b.date.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })} · {b.startTime}
                    </div>
                  </div>
                  <div className="font-medium text-blush-500">{formatZAR(b.service.price)}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function countRepeats(emails: string[]) {
  const counts: Record<string, number> = {};
  for (const e of emails) counts[e.toLowerCase()] = (counts[e.toLowerCase()] || 0) + 1;
  return Object.values(counts).filter((c) => c >= 2).length;
}

function StatCard({
  label,
  value,
  icon,
  variant,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant: "blush" | "lavender" | "sage" | "cream";
}) {
  const bg = {
    blush: "bg-blush-50 text-blush-500",
    lavender: "bg-lavender-50 text-lavender-500",
    sage: "bg-sage-50 text-sage-500",
    cream: "bg-cream-50 text-amber-700",
  }[variant];
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${bg}`}>{icon}</div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
