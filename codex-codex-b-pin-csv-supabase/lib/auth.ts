import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin, supabasePublic } from "@/lib/supabase";

const ACCESS_COOKIE = "bl_access_token";
const REFRESH_COOKIE = "bl_refresh_token";

export async function signInAdmin(email: string, password: string) {
  const supabase = supabasePublic();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    return { ok: false, message: "登入失敗，請確認 Email 與密碼。" };
  }

  const admin = supabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false, message: "此帳號尚未設定為管理員。" };
  }

  const store = await cookies();
  store.set(ACCESS_COOKIE, data.session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: data.session.expires_in
  });
  store.set(REFRESH_COOKIE, data.session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return { ok: true, message: "登入成功" };
}

export async function signOutAdmin() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getAdminUser() {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  const supabase = supabasePublic();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  const admin = supabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return null;
  return { id: data.user.id, email: data.user.email, displayName: profile.display_name ?? "管理員" };
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
