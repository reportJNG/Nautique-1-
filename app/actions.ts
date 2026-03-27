"use server";

import { clearAuthCookie } from "@/lib/auth/jwt";
import { redirect } from "@/i18n/navigation";

export async function logout() {
  await clearAuthCookie();
  redirect({ href: "/", locale: "fr" });
}
