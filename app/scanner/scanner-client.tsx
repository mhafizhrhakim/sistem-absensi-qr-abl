"use client";

import Script from "next/script";
import { useRef, useState } from "react";

declare global {
  interface Window {
    Html5Qrcode?: any;
  }
}

export function ScannerClient() {
  const scannerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("Arahkan kamera ke QR absensi.");

  async function startScanner() {
    if (!window.Html5Qrcode) return;
    setMessage("Meminta akses kamera...");
    const scanner = new window.Html5Qrcode("qr-reader");
    scannerRef.current = scanner;
    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 260, height: 260 } },
      async (decodedText: string) => {
        setMessage("QR terbaca. Mengalihkan...");
        await scanner.stop();
        setRunning(false);
        const value = decodedText.trim();
        try {
          const url = new URL(value);
          window.location.href = url.pathname;
        } catch {
          window.location.href = value.startsWith("/scan/") ? value : "/scan/" + value;
        }
      }
    );
    setRunning(true);
    setMessage("Scanner aktif.");
  }

  async function stopScanner() {
    if (scannerRef.current) await scannerRef.current.stop();
    setRunning(false);
    setMessage("Scanner dihentikan.");
  }

  return (
    <div className="scannerCard">
      <Script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js" onLoad={() => setReady(true)} />
      <div id="qr-reader" className="qrReader" />
      <p className="muted center">{message}</p>
      <div className="buttonRow center">
        {!running ? <button className="primaryButton" onClick={startScanner} disabled={!ready}>Mulai scan</button> : null}
        {running ? <button className="ghostButton" onClick={stopScanner}>Stop</button> : null}
      </div>
    </div>
  );
}
