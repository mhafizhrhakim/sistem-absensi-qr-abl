import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export type Role = "dosen" | "mahasiswa";

export type AppSession = {
  userId: string;
  username: string;
  role: Role;
  name: string;
  nim?: string | null;
};

const COOKIE_NAME = "absensi_session";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 24) {
    throw new Error("SESSION_SECRET must be at least 24 characters.");
  }
  return value;
}

function toBase64Url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function signPayload(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function setSession(session: AppSession) {
  const payload = toBase64Url(JSON.stringify(session));
  const signature = signPayload(payload);
  cookies().set(COOKIE_NAME, payload + "." + signature, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function getSession(): AppSession | null {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const expected = signPayload(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AppSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().delete(COOKIE_NAME);
}
