"use server";

import { redirect } from "next/navigation";
import { dashboardPath, safeNextPath } from "@/lib/auth";
import { setSession, Role } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

type AuthUserRow = {
  id: string;
  username: string;
  role: Role;
  full_name: string;
  nim: string | null;
};

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

  const user = data as AuthUserRow;
  setSession({
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.full_name,
    nim: user.nim
  });

  redirect(next || dashboardPath(user.role));
}
