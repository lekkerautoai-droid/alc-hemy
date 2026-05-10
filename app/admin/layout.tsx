import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { LayoutDashboard, CalendarRange, CalendarDays, ListTodo, Sparkles, LogOut, Home } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthed();

  return (
    <div className="min-h-screen">
      {authed ? (
        <div className="flex min-h-screen flex-col lg:flex-row">
          <aside className="border-b border-blush-100 bg-white/80 backdrop-blur-sm lg:w-64 lg:border-b-0 lg:border-r">
            <div className="px-6 py-6">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="text-2xl">🐾</span>
                <span className="font-display text-lg font-semibold">Admin</span>
              </Link>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-3 lg:pb-6">
              <NavLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
              <NavLink href="/admin/bookings" icon={<CalendarRange className="h-4 w-4" />} label="Bookings" />
              <NavLink href="/admin/availability" icon={<CalendarDays className="h-4 w-4" />} label="Availability" />
              <NavLink href="/admin/services" icon={<ListTodo className="h-4 w-4" />} label="Services" />
              <NavLink href="/admin/blocked" icon={<Sparkles className="h-4 w-4" />} label="Blocked dates" />
            </nav>
            <div className="border-t border-blush-100 p-3 lg:absolute lg:bottom-0 lg:w-64">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-muted-foreground hover:bg-blush-50"
              >
                <Home className="h-4 w-4" /> Public site
              </Link>
              <form action="/api/admin/logout" method="post">
                <button
                  type="submit"
                  className="mt-1 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-muted-foreground hover:bg-blush-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </form>
            </div>
          </aside>
          <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-blush-50 hover:text-blush-500"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

