"use server";

import { redirect } from "next/navigation";
import { dashboardPath } from "@/lib/auth";
import { Role, setSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

type RegisterState = {
  error?: string;
};

export async function registerAction(_state: RegisterState, formData: FormData): Promise<RegisterState> {
  const fullName = String(formData.get("full_name") || "").trim();
  const role = String(formData.get("role") || "mahasiswa") as Role;
  const nim = String(formData.get("nim") || "").trim();
  const usernameInput = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");
  const username = role === "mahasiswa" ? nim : usernameInput;

  if (!['dosen', 'mahasiswa'].includes(role)) {
    return { error: "Role tidak valid." };
  }

  if (!fullName || !username || !password || !confirmPassword) {
    return { error: "Semua field wajib diisi." };
  }

  if (role === "mahasiswa") {
    if (!nim) {
      return { error: "NIM wajib diisi untuk mahasiswa." };
    }
    if (!/^\d+$/.test(nim)) {
      return { error: "NIM hanya boleh berisi angka." };
    }
    if (nim.length < 7) {
      return { error: "NIM minimal 7 digit." };
    }
  }

  if (role === "dosen") {
    if (username.length < 5) {
      return { error: "Username dosen minimal 5 karakter." };
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      return { error: "Username dosen hanya boleh huruf, angka, titik, underscore, atau strip." };
    }
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  if (password !== confirmPassword) {
    return { error: "Konfirmasi password tidak sama." };
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .rpc("register_user", {
      p_username: username,
      p_password: password,
      p_role: role,
      p_full_name: fullName,
      p_nim: role === "mahasiswa" ? nim : null
    })
    .maybeSingle();

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("duplicate") || message.includes("unique") || message.includes("already")) {
      return { error: role === "mahasiswa" ? "NIM sudah terdaftar." : "Username dosen sudah terdaftar." };
    }
    console.error("Register RPC error", error);
    return { error: process.env.NODE_ENV === "development" ? error.message : "Registrasi gagal." };
  }

  if (!data) {
    return { error: "Registrasi gagal. Coba ulangi." };
  }

  setSession({
    userId: data.id,
    username: data.username,
    role: data.role as Role,
    name: data.full_name,
    nim: data.nim
  });

  redirect(dashboardPath(data.role as Role));
}
