import { requireRole } from "@/lib/auth";
import { ScannerClient } from "./scanner-client";

export default function ScannerPage() {
  requireRole("mahasiswa");
  return (
    <section className="pageShell narrow">
      <div className="pageHeader center">
        <p className="eyebrow">Scanner mahasiswa</p>
        <h1>Scan QR absensi</h1>
        <p className="muted">Pastikan kamera mendapat izin akses dari browser.</p>
      </div>
      <ScannerClient />
    </section>
  );
}
