import { isAdminAuthed } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlockedDatesEditor } from "./blocked-editor";

export const dynamic = "force-dynamic";

export default async function BlockedPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const dates = await prisma.blockedDate.findMany({ orderBy: { date: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Blocked dates</h1>
        <p className="mt-1 text-muted-foreground">Block out specific days — exam week, holidays, family stuff.</p>
      </div>
      <BlockedDatesEditor dates={dates.map((d) => ({ id: d.id, date: d.date.toISOString().slice(0, 10), reason: d.reason }))} />
    </div>
  );
}
