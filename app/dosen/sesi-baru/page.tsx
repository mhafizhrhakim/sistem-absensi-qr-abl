import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { createSessionAction } from "../actions";

export default async function NewSessionPage({ searchParams }: { searchParams: { error?: string } }) {
  const session = requireRole("dosen");
  const supabase = supabaseAdmin();
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, code")
    .eq("lecturer_id", session.userId)
    .in("code", ["KH-001", "KH-002", "KH-003"])
    .order("code");

  return (
    <section className="pageShell narrow">
      <div className="pageHeader">
        <Link className="smallLink" href="/dosen">Kembali</Link>
        <h1>Buat sesi absensi</h1>
        <p className="muted">Pilih kode kelas, isi nama mata kuliah, lalu sistem akan membuat token QR otomatis.</p>
      </div>

      <form className="formCard" action={createSessionAction}>
        <label>
          Kelas
          <select name="class_id" required>
            <option value="">Pilih kode kelas</option>
            {(classes || []).map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}
          </select>
        </label>
        <label>
          Mata kuliah
          <input name="course_name" placeholder="Contoh: Arsitektur Berbasis Layanan" required />
        </label>
        <label>
          Pertemuan ke
          <input name="meeting_no" type="number" min="1" defaultValue="1" required />
        </label>
        <div className="formGrid3">
          <label>
            Tanggal
            <input name="date" type="date" required />
          </label>
          <label>
            Jam mulai
            <input name="start_time" type="time" required />
          </label>
          <label>
            Jam selesai
            <input name="end_time" type="time" required />
          </label>
        </div>
        {searchParams.error ? <p className="alert danger">{searchParams.error}</p> : null}
        <button className="primaryButton" type="submit">Simpan dan buat QR</button>
      </form>
    </section>
  );
}
