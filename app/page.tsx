import { redirect } from "next/navigation";
import { dashboardPath } from "@/lib/auth";
import { getSession } from "@/lib/session";

export default function HomePage() {
  const session = getSession();
  redirect(session ? dashboardPath(session.role) : "/login");
}
