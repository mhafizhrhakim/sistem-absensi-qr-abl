import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { regenerateTokenAction } from "@/app/dosen/actions";
import { requireRole } from "@/lib/auth";
import { formatDateTime, formatTime, sessionStatus } from "@/lib/format";
import { supabaseAdmin } from "@/lib/supabase";

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const session = requireRole("dosen");
  const supabase = supabaseAdmin();

  const { data: item } = await supabase
    .from("attendance_sessions")
    .select("id, course_name, meeting_no, starts_at, ends_at, token, classes(name, code)")
    .eq("id", params.id)
    .eq("created_by", session.userId)
    .maybeSingle();

  if (!item) notFound();

  const { data: attendances } = await supabase
    .from("attendances")
    .select("id, attended_at, app_users(full_name, nim)")
    .eq("session_id", params.id)
    .order("attended_at", { ascending: true });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const scanUrl = baseUrl.replace(/\/$/, "") + "/scan/" + item.token;
  const qrDataUrl = await QRCode.toDataURL(scanUrl, { margin: 2, width: 360 });
  const status = sessionStatus(item.starts_at, item.ends_at);

  return (
    <section className="pageShell">
      <div className="pageHeader split">
        <div>
          <Link className="smallLink" href="/dosen">Kembali</Link>
          <p className="eyebrow">Detail sesi</p>
          <h1>{item.course_name}</h1>
          <p className="muted">Pertemuan {item.meeting_no} - Kode kelas {(item.classes as any)?.code}</p>
        </div>
        <div className="buttonRow">
          <a className="ghostButton" href={"/dosen/sesi/" + item.id + "/export"}>Export CSV</a>
          <form action={regenerateTokenAction}>
            <input type="hidden" name="session_id" value={item.id} />
            <button className="ghostButton" type="submit">Regenerate QR</button>
          </form>
        </div>
      </div>

      <div className="detailGrid">
        <div className="qrPanel">
          <img src={qrDataUrl} alt="QR Code absensi" width={360} height={360} />
          <p className="scanUrl">{scanUrl}</p>
        </div>
        <div className="infoPanel">
          <div className="infoRow"><span>Status</span><strong className={"badge " + status.tone}>{status.label}</strong></div>
          <div className="infoRow"><span>Mulai</span><strong>{formatDateTime(item.starts_at)}</strong></div>
          <div className="infoRow"><span>Selesai</span><strong>{formatTime(item.ends_at)}</strong></div>
          <div className="infoRow"><span>Total hadir</span><strong>{attendances?.length || 0}</strong></div>
        </div>
      </div>

      <div className="sectionTitle"><h2>Daftar hadir</h2></div>
      <div className="tableCard">
        <table>
          <thead><tr><th>No</th><th>NIM</th><th>Nama</th><th>Waktu absen</th></tr></thead>
          <tbody>
            {(attendances || []).map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>{(row.app_users as any)?.nim}</td>
                <td><strong>{(row.app_users as any)?.full_name}</strong></td>
                <td>{formatDateTime(row.attended_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!attendances?.length ? <p className="emptyState">Belum ada mahasiswa yang absen.</p> : null}
      </div>
    </section>
  );
}
