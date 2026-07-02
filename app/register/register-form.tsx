"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { registerAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="primaryButton full" type="submit" disabled={pending}>{pending ? "Mendaftarkan..." : "Daftar"}</button>;
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, {});
  const [role, setRole] = useState("mahasiswa");

  return (
    <form className="formStack" action={formAction}>
      <label>
        Nama lengkap
        <input name="full_name" placeholder="Contoh: Andi Pratama" required />
      </label>
      <label>
        Role
        <select name="role" value={role} onChange={(event) => setRole(event.target.value)} required>
          <option value="mahasiswa">Mahasiswa</option>
          <option value="dosen">Dosen</option>
        </select>
      </label>
      {role === "mahasiswa" ? (
        <label>
          NIM
          <input name="nim" inputMode="numeric" pattern="[0-9]{7,}" minLength={7} placeholder="Contoh: 2201001" required />
        </label>
      ) : (
        <label>
          Username dosen
          <input name="username" minLength={5} pattern="[a-zA-Z0-9._-]+" placeholder="Contoh: hermansyah" required />
        </label>
      )}
      <label>
        Password
        <input name="password" type="password" placeholder="Minimal 6 karakter" required />
      </label>
      <label>
        Konfirmasi password
        <input name="confirm_password" type="password" placeholder="Ulangi password" required />
      </label>
      {state.error ? <p className="alert danger">{state.error}</p> : null}
      <SubmitButton />
      <p className="muted center compactText">Sudah punya akun? <Link className="smallLink" href="/login">Masuk</Link></p>
    </form>
  );
}
