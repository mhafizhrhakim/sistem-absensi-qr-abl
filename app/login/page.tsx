import Link from "next/link";
import { redirect } from "next/navigation";
import { dashboardPath } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const session = getSession();
  if (session) redirect(dashboardPath(session.role));

  return (
    <section className="authShell">
      <div className="authPanel">
        <div>
          <p className="eyebrow">Sistem Absensi QR</p>
          <h1>Masuk ke layanan absensi</h1>
          <p className="muted">Mahasiswa masuk memakai NIM, sedangkan dosen masuk memakai username.</p>
        </div>
        <LoginForm next={searchParams.next} />
        <div className="demoBox">
          <strong>Akun demo</strong>
          <span>Dosen: dosen1 / dosen123</span>
          <span>Mahasiswa: 2201001 / mhs123</span>
        </div>
        <p className="muted center compactText">Belum punya akun? <Link className="smallLink" href="/register">Daftar sekarang</Link></p>
      </div>
    </section>
  );
}
