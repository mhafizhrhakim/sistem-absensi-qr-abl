import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { supabaseAdmin } from "@/lib/supabase";

export default async function MahasiswaDashboard() {
  const session = requireRole("mahasiswa");
  const supabase = supabaseAdmin();

  const { data: rows } = await supabase
    .from("attendances")
    .select("id, attended_at, attendance_sessions(course_name, meeting_no, starts_at, classes(name, code))")
    .eq("student_id", session.userId)
    .order("attended_at", { ascending: false });

  return (
    <section className="pageShell">
      <div className="pageHeader split">
        <div>
          <p className="eyebrow">Dashboard mahasiswa</p>
          <h1>Halo, {session.name}</h1>
          <p className="muted">NIM {session.nim} - lihat riwayat dan scan QR absensi.</p>
        </div>
        <Link className="primaryButton" href="/scanner">Buka scanner</Link>
      </div>

      <div className="statsGrid two">
        <div className="statCard"><span>Total kehadiran</span><strong>{rows?.length || 0}</strong></div>
        <div className="statCard"><span>Status akun</span><strong>Aktif</strong></div>
      </div>

      <div className="sectionTitle"><h2>Riwayat absensi</h2></div>
      <div className="tableCard">
        <table>
          <thead><tr><th>Mata kuliah</th><th>Pertemuan</th><th>Waktu absen</th></tr></thead>
          <tbody>
            {(rows || []).map((row) => {
              const sesi = row.attendance_sessions as any;
              return (
                <tr key={row.id}>
                  <td><strong>{sesi?.course_name}</strong><span>{sesi?.classes?.name}</span></td>
                  <td>{sesi?.meeting_no}</td>
                  <td>{formatDateTime(row.attended_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows?.length ? <p className="emptyState">Belum ada riwayat absensi.</p> : null}
      </div>
    </section>
  );
}
