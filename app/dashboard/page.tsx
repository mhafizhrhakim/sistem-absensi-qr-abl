import { redirect } from "next/navigation";
import { dashboardPath, requireSession } from "@/lib/auth";

export default function DashboardPage() {
  const session = requireSession();
  redirect(dashboardPath(session.role));
}
