import { isAdminAuthed } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AvailabilityEditor } from "./availability-editor";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const rules = await prisma.availabilityRule.findMany({ orderBy: { dayOfWeek: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Weekly availability</h1>
        <p className="mt-1 text-muted-foreground">
          Set your default working hours for each day. New bookings can only land in these windows.
        </p>
      </div>
      <AvailabilityEditor rules={rules} />
    </div>
  );
}
