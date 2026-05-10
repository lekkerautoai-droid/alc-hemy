import { isAdminAuthed } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServicesEditor } from "./services-editor";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Services</h1>
        <p className="mt-1 text-muted-foreground">Edit your services, prices, and durations.</p>
      </div>
      <ServicesEditor services={services} />
    </div>
  );
}
