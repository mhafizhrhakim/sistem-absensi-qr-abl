import { redirect } from "next/navigation";
import { dashboardPath } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  const session = getSession();
  if (session) redirect(dashboardPath(session.role));

  return (
    <section className="authShell">
      <div className="authPanel">
        <div>
          <p className="eyebrow">Registrasi akun</p>
          <h1>Buat akun absensi</h1>
          <p className="muted">Daftar sebagai mahasiswa atau dosen untuk mencoba sistem absensi QR.</p>
        </div>
        <RegisterForm />
      </div>
    </section>
  );
}
