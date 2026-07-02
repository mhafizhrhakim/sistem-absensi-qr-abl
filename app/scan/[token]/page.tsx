import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { formatDateTime } from "@/lib/format";
import { supabaseAdmin } from "@/lib/supabase";

function ResultCard({ tone, title, message, href }: { tone: string; title: string; message: string; href: string }) {
  return (
    <section className="resultShell">
      <div className={"resultCard " + tone}>
        <p className="eyebrow">Hasil scan</p>
        <h1>{title}</h1>
        <p className="muted">{message}</p>
        <Link className="primaryButton" href={href}>Kembali ke dashboard</Link>
      </div>
    </section>
  );
}

export default async function ScanPage({ params }: { params: { token: string } }) {
  const session = getSession();
  const currentPath = "/scan/" + params.token;
  if (!session) redirect("/login?next=" + encodeURIComponent(currentPath));
  if (session.role !== "mahasiswa") {
    return <ResultCard tone="dangerTone" title="Akses ditolak" message="Hanya akun mahasiswa yang dapat melakukan absensi." href="/dosen" />;
  }

  const supabase = supabaseAdmin();
  const { data: item } = await supabase
    .from("attendance_sessions")
    .select("id, class_id, course_name, meeting_no, starts_at, ends_at")
    .eq("token", params.token)
    .maybeSingle();

  if (!item) {
    return <ResultCard tone="dangerTone" title="QR tidak valid" message="Token sesi tidak ditemukan atau sudah diganti." href="/mahasiswa" />;
  }

  const now = Date.now();
  const start = new Date(item.starts_at).getTime();
  const end = new Date(item.ends_at).getTime();

  if (now < start) {
    return <ResultCard tone="infoTone" title="Sesi belum dimulai" message={"Absensi dibuka pada " + formatDateTime(item.starts_at) + "."} href="/mahasiswa" />;
  }

  if (now > end) {
    return <ResultCard tone="dangerTone" title="Sesi sudah berakhir" message={"Batas absensi adalah " + formatDateTime(item.ends_at) + "."} href="/mahasiswa" />;
  }

  const { error } = await supabase
    .from("attendances")
    .insert({ session_id: item.id, student_id: session.userId });

  if (error?.code === "23505") {
    return <ResultCard tone="infoTone" title="Sudah absen" message="Kehadiran kamu untuk sesi ini sudah tercatat sebelumnya." href="/mahasiswa" />;
  }

  if (error) {
    return <ResultCard tone="dangerTone" title="Gagal mencatat" message="Terjadi kendala saat menyimpan absensi. Coba ulangi sebentar lagi." href="/mahasiswa" />;
  }

  return <ResultCard tone="successTone" title="Absensi berhasil" message={"Kehadiran untuk " + item.course_name + " pertemuan " + item.meeting_no + " sudah tercatat."} href="/mahasiswa" />;
}
