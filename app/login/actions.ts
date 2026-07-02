"use server";

import { redirect } from "next/navigation";
import { dashboardPath, safeNextPath } from "@/lib/auth";
import { setSession, Role } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

type LoginState = {
  error?: string;
};

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const next = safeNextPath(formData.get("next"));

  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .rpc("verify_login", { p_username: username, p_password: password })
    .maybeSingle();

  if (error) {
    console.error("Login RPC error", error);
    return { error: process.env.NODE_ENV === "development" ? error.message : "Username atau password salah." };
  }

  if (!data) {
    return { error: "Username atau password salah." };
  }

  const role = data.role as Role;
  setSession({
    userId: data.id,
    username: data.username,
    role,
    name: data.full_name,
    nim: data.nim
  });

  redirect(next || dashboardPath(role));
}
