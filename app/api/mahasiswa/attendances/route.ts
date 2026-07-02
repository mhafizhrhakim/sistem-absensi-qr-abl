import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = getSession();
  if (!session || session.role !== "mahasiswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("attendances")
    .select("id, attended_at, attendance_sessions(course_name, meeting_no, starts_at, ends_at, classes(name, code))")
    .eq("student_id", session.userId)
    .order("attended_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attendances: data || [] });
}
