"use server";

import { redirect } from "next/navigation";
import { checkAdminPassword, createAdminSession } from "@/lib/auth";

export async function loginAction(password: string) {
  if (!password) return { ok: false, error: "Password required" };
  if (!checkAdminPassword(password)) {
    return { ok: false, error: "Wrong password" };
  }
  await createAdminSession();
  redirect("/admin");
}
