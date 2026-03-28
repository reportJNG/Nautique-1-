import { cookies } from "next/headers";
import { verifyToken, type Session, type AgentSession, type AdherentSession } from "./jwt";
const AUTH_COOKIE = "auth-token";
export async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token)
        return null;
    return verifyToken(token);
}
export async function requireSession(): Promise<Session> {
    const session = await getSession();
    if (!session) {
        throw new Error("Unauthorized");
    }
    return session;
}
export async function requireAdherent(): Promise<AdherentSession> {
    const session = await getSession();
    if (!session || session.type !== "adherent") {
        throw new Error("Unauthorized - Adherent access required");
    }
    return session;
}
export async function requireAgent(): Promise<AgentSession> {
    const session = await getSession();
    if (!session || session.type !== "agent") {
        throw new Error("Unauthorized - Agent access required");
    }
    return session;
}
export async function requireRole(allowedRoles: string[]): Promise<AgentSession> {
    const session = await requireAgent();
    if (!allowedRoles.includes(session.roleCode)) {
        throw new Error("Forbidden - Insufficient permissions");
    }
    return session;
}
export async function setSessionCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 8 * 60 * 60,
        path: "/",
    });
}
export async function clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE);
}
