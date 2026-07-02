import { redirect } from "next/navigation";
import { AppSession, getSession, Role } from "@/lib/session";

export function requireSession(): AppSession {
  const session = getSession();
  if (!session) redirect("/login");
  return session;
}

export function requireRole(role: Role): AppSession {
  const session = requireSession();
  if (session.role !== role) redirect("/dashboard");
  return session;
}

export function dashboardPath(role: Role) {
  return role === "dosen" ? "/dosen" : "/mahasiswa";
}

export function safeNextPath(value: FormDataEntryValue | string | null) {
  if (typeof value !== "string" || !value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}
