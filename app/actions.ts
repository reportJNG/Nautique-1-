"use server";
import { clearSessionCookie } from "@/lib/auth/session";
import { redirect } from "@/i18n/navigation";
export async function logout() {
    await clearSessionCookie();
    redirect({ href: "/", locale: "fr" });
}
