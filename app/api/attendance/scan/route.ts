import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = getSession();
  if (!session || session.role !== "mahasiswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { token?: string } | null;
  const token = body?.token?.trim();
  if (!token) {
    return NextResponse.json({ error: "Token wajib dikirim." }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { data: attendanceSession, error: sessionError } = await supabase
    .from("attendance_sessions")
    .select("id, class_id, course_name, meeting_no, starts_at, ends_at")
    .eq("token", token)
    .maybeSingle();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  if (!attendanceSession) {
    return NextResponse.json({ error: "QR tidak valid." }, { status: 404 });
  }

  const now = Date.now();
  const start = new Date(attendanceSession.starts_at).getTime();
  const end = new Date(attendanceSession.ends_at).getTime();

  if (now < start) {
    return NextResponse.json({ error: "Sesi belum dimulai." }, { status: 409 });
  }

  if (now > end) {
    return NextResponse.json({ error: "Sesi sudah berakhir." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("attendances")
    .insert({ session_id: attendanceSession.id, student_id: session.userId })
    .select("id, attended_at")
    .single();

  if (error?.code === "23505") {
    return NextResponse.json({ error: "Mahasiswa sudah absen pada sesi ini." }, { status: 409 });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Absensi berhasil dicatat.", attendance: data, session: attendanceSession }, { status: 201 });
}
