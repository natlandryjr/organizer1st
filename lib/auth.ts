import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);
const COOKIE_NAME = "organizer1st_session";

export type SessionPayload = {
  userId: string;
  email: string;
  organizationId: string;
  exp: number;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    organizationId: payload.organizationId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(JWT_SECRET);
  return token;
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      organizationId: payload.organizationId as string,
      exp: (payload.exp as number) ?? 0,
    };
  } catch {
    return null;
  }
}

export function getCookieName() {
  return COOKIE_NAME;
}
