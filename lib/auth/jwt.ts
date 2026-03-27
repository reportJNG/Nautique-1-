// lib/auth/jwt.ts
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export type AgentSession = {
  type: "agent";
  id: number;
  login: string;
  roleCode: string;
  nom: string;
  prenom: string;
};

export type AdherentSession = {
  type: "adherent";
  id: number;
  numeroDossier: string;
  nom: string;
  prenom: string;
};

export type Session = AgentSession | AdherentSession;

export async function signToken(payload: Session): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as Session;
  } catch {
    return null;
  }
}
