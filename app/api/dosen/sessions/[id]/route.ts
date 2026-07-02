import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || session.role !== "dosen") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = supabaseAdmin();
  const { data: attendanceSession, error: sessionError } = await supabase
    .from("attendance_sessions")
    .select("id, course_name, meeting_no, starts_at, ends_at, token, classes(name, code)")
    .eq("id", params.id)
    .eq("created_by", session.userId)
    .maybeSingle();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  if (!attendanceSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { data: attendances, error: attendanceError } = await supabase
    .from("attendances")
    .select("id, attended_at, app_users(full_name, nim)")
    .eq("session_id", params.id)
    .order("attended_at", { ascending: true });

  if (attendanceError) {
    return NextResponse.json({ error: attendanceError.message }, { status: 500 });
  }

  return NextResponse.json({ session: attendanceSession, attendances: attendances || [] });
}
