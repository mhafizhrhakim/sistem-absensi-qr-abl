import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return '"' + text.replace(/"/g, '""') + '"';
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || session.role !== "dosen") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = supabaseAdmin();
  const { data: item } = await supabase
    .from("attendance_sessions")
    .select("id, course_name, meeting_no")
    .eq("id", params.id)
    .eq("created_by", session.userId)
    .maybeSingle();

  if (!item) return new NextResponse("Not found", { status: 404 });

  const { data: rows } = await supabase
    .from("attendances")
    .select("attended_at, app_users(full_name, nim)")
    .eq("session_id", params.id)
    .order("attended_at", { ascending: true });

  const lines = [["No", "NIM", "Nama", "Waktu Absen"]];
  (rows || []).forEach((row, index) => {
    lines.push([
      String(index + 1),
      (row.app_users as any)?.nim || "",
      (row.app_users as any)?.full_name || "",
      new Date(row.attended_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
    ]);
  });

  const csv = lines.map((line) => line.map(csvCell).join(";")).join("\n");
  const filename = ("absensi-" + item.course_name + "-pertemuan-" + item.meeting_no + ".csv")
    .replace(/\s+/g, "-")
    .toLowerCase();

  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=" + filename
    }
  });
}
