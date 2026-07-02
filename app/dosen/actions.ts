"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

function jakartaDateTimeToIso(date: string, time: string) {
  return new Date(date + "T" + time + ":00+07:00").toISOString();
}

export async function createSessionAction(formData: FormData) {
  const session = requireRole("dosen");
  const classId = String(formData.get("class_id") || "");
  const courseName = String(formData.get("course_name") || "").trim();
  const meetingNo = Number(formData.get("meeting_no") || 0);
  const date = String(formData.get("date") || "");
  const startTime = String(formData.get("start_time") || "");
  const endTime = String(formData.get("end_time") || "");

  if (!classId || !courseName || !meetingNo || !date || !startTime || !endTime) {
    redirect("/dosen/sesi-baru?error=Lengkapi semua field");
  }

  const startsAt = jakartaDateTimeToIso(date, startTime);
  const endsAt = jakartaDateTimeToIso(date, endTime);

  if (new Date(endsAt) <= new Date(startsAt)) {
    redirect("/dosen/sesi-baru?error=Jam selesai harus lebih besar dari jam mulai");
  }

  const supabase = supabaseAdmin();
  const { data: lecturerClass } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("lecturer_id", session.userId)
    .maybeSingle();

  if (!lecturerClass) redirect("/dosen/sesi-baru?error=Kelas tidak valid");

  const { data, error } = await supabase
    .from("attendance_sessions")
    .insert({
      class_id: classId,
      course_name: courseName,
      meeting_no: meetingNo,
      starts_at: startsAt,
      ends_at: endsAt,
      created_by: session.userId
    })
    .select("id")
    .single();

  if (error || !data) redirect("/dosen/sesi-baru?error=Gagal membuat sesi");
  redirect("/dosen/sesi/" + data.id);
}

export async function regenerateTokenAction(formData: FormData) {
  const session = requireRole("dosen");
  const id = String(formData.get("session_id") || "");
  const supabase = supabaseAdmin();

  await supabase
    .from("attendance_sessions")
    .update({ token: randomUUID() })
    .eq("id", id)
    .eq("created_by", session.userId);

  revalidatePath("/dosen/sesi/" + id);
}
