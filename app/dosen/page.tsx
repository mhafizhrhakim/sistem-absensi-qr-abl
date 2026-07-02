import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { formatDateTime, sessionStatus } from "@/lib/format";
import { supabaseAdmin } from "@/lib/supabase";

export default async function DosenDashboard() {
  const session = requireRole("dosen");
  const supabase = supabaseAdmin();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, code")
    .eq("lecturer_id", session.userId)
    .order("name");

  const { data: sessions } = await supabase
    .from("attendance_sessions")
    .select("id, course_name, meeting_no, starts_at, ends_at, classes(name, code)")
    .eq("created_by", session.userId)
    .order("starts_at", { ascending: false });

  const sessionIds = (sessions || []).map((item) => item.id);
  const { data: attendanceRows } = sessionIds.length
    ? await supabase.from("attendances").select("session_id").in("session_id", sessionIds)
    : { data: [] as Array<{ session_id: string }> };

  const countMap = new Map<string, number>();
  for (const row of attendanceRows || []) countMap.set(row.session_id, (countMap.get(row.session_id) || 0) + 1);

  return (
    <section className="pageShell">
      <div className="pageHeader split">
        <div>
          <p className="eyebrow">Dashboard dosen</p>
          <h1>Halo, {session.name}</h1>
          <p className="muted">Kelola sesi absensi, tampilkan QR, dan export rekap kehadiran.</p>
        </div>
        <Link className="primaryButton" href="/dosen/sesi-baru">Buat sesi</Link>
      </div>

      <div className="statsGrid">
        <div className="statCard"><span>Kelas</span><strong>{classes?.length || 0}</strong></div>
        <div className="statCard"><span>Sesi</span><strong>{sessions?.length || 0}</strong></div>
        <div className="statCard"><span>Total absen</span><strong>{[...countMap.values()].reduce((a, b) => a + b, 0)}</strong></div>
      </div>

      <div className="sectionTitle">
        <h2>Sesi terbaru</h2>
      </div>

      <div className="tableCard">
        <table>
          <thead>
            <tr>
              <th>Mata kuliah</th>
              <th>Pertemuan</th>
              <th>Jadwal</th>
              <th>Status</th>
              <th>Hadir</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(sessions || []).map((item) => {
              const status = sessionStatus(item.starts_at, item.ends_at);
              return (
                <tr key={item.id}>
                  <td><strong>{item.course_name}</strong><span>Kode kelas: {(item.classes as any)?.code}</span></td>
                  <td>{item.meeting_no}</td>
                  <td>{formatDateTime(item.starts_at)}</td>
                  <td><span className={"badge " + status.tone}>{status.label}</span></td>
                  <td>{countMap.get(item.id) || 0}</td>
                  <td><Link className="smallLink" href={"/dosen/sesi/" + item.id}>Detail</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!sessions?.length ? <p className="emptyState">Belum ada sesi absensi.</p> : null}
      </div>
    </section>
  );
}
