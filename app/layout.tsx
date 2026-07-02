import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { getSession } from "@/lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Absensi QR ABL",
  description: "Sistem absensi QR berbasis layanan dengan Next.js dan Supabase"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();

  return (
    <html lang="id">
      <body>
        <header className="topbar">
          <Link className="brand" href="/dashboard">
            <span className="brandMark">AQ</span>
            <span>
              <strong>Absensi QR</strong>
              <small>Arsitektur Berbasis Layanan</small>
            </span>
          </Link>

          {session ? (
            <nav className="navActions">
              <Link href={session.role === "dosen" ? "/dosen" : "/mahasiswa"}>Dashboard</Link>
              {session.role === "mahasiswa" ? <Link href="/scanner">Scanner</Link> : null}
              <span className="userPill">{session.name}</span>
              <form action={logoutAction}>
                <button className="ghostButton" type="submit">Keluar</button>
              </form>
            </nav>
          ) : null}
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
