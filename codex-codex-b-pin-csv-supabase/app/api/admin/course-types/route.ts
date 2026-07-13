import { NextResponse } from "next/server";
import { cleanOptional, jsonError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    if (!name) throw new Error("請輸入課程名稱。");
    const { error } = await supabaseAdmin().from("course_types").insert({
      name,
      description: cleanOptional(body.description),
      sort_order: Number(body.sortOrder ?? 99),
      is_active: Boolean(body.isActive ?? true)
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { error } = await supabaseAdmin()
      .from("course_types")
      .update({
        name: String(body.name ?? "").trim(),
        description: cleanOptional(body.description),
        sort_order: Number(body.sortOrder ?? 99),
        is_active: Boolean(body.isActive)
      })
      .eq("id", String(body.id ?? ""));
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
