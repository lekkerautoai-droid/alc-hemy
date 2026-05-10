import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdminAuthed()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">🐾</div>
          <h1 className="font-display text-3xl font-semibold">Admin sign-in</h1>
          <p className="mt-1 text-sm text-muted-foreground">For Anabel only.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
