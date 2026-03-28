import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth/jwt";
const locales = ["fr", "en", "ar"];
const defaultLocale = "fr";
const ADHERENT_PATHS = ["/espace"];
const AGENT_PATHS = ["/admin"];
const AUTH_PATHS = ["/auth/login", "/auth/adherent/login", "/auth/adherent/signup"];
const ADMIN_ONLY_PATHS = ["/admin/agents", "/admin/parametres"];
function getLocale(request: NextRequest): string {
    const acceptLang = request.headers.get("accept-language");
    if (acceptLang) {
        const preferred = acceptLang.split(",")[0].split("-")[0];
        if (locales.includes(preferred))
            return preferred;
    }
    return defaultLocale;
}
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);
    let locale = defaultLocale;
    let pathnameWithoutLocale = pathname;
    if (pathnameHasLocale) {
        const parts = pathname.split("/");
        locale = parts[1];
        pathnameWithoutLocale = "/" + parts.slice(2).join("/");
    }
    else {
        locale = getLocale(request);
        const newUrl = new URL(`/${locale}${pathname}`, request.url);
        newUrl.search = request.nextUrl.search;
        return NextResponse.redirect(newUrl);
    }
    const token = request.cookies.get("auth-token")?.value;
    const session = token ? await verifyToken(token) : null;
    const isAdherentPath = ADHERENT_PATHS.some((path) => pathnameWithoutLocale.startsWith(path));
    const isAgentPath = AGENT_PATHS.some((path) => pathnameWithoutLocale.startsWith(path));
    const isAuthPath = AUTH_PATHS.some((path) => pathnameWithoutLocale.startsWith(path));
    if (isAuthPath && session) {
        if (session.type === "agent") {
            return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
        }
        if (session.type === "adherent") {
            return NextResponse.redirect(new URL(`/${locale}/espace`, request.url));
        }
    }
    if (isAdherentPath) {
        if (!session || session.type !== "adherent") {
            return NextResponse.redirect(new URL(`/${locale}/auth/adherent/login`, request.url));
        }
    }
    if (isAgentPath) {
        if (!session || session.type !== "agent") {
            return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
        }
        const isAdminOnly = ADMIN_ONLY_PATHS.some((path) => pathnameWithoutLocale.startsWith(path));
        if (isAdminOnly && session.roleCode !== "ADMIN" && session.roleCode !== "DIR") {
            return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
        }
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", locale);
    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
    return response;
}
export const config = {
    matcher: [
        "/((?!_next|api|favicon.ico|.*\..*).*)",
    ],
};
