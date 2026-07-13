import { NextResponse } from "next/server";
import { csvResponse, jsonError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { weekdayLabel } from "@/lib/constants";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const supabase = supabaseAdmin();
    let query = supabase
      .from("registrations")
      .select("*, classes(title, weekday,start_time,end_time, course_types(name))")
      .order("created_at", { ascending: false });
    if (searchParams.get("classId")) query = query.eq("class_id", searchParams.get("classId"));
    if (searchParams.get("status")) query = query.eq("status", searchParams.get("status"));
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    const rows = (data ?? []).map((row) => ({
      姓名: row.full_name,
      LINE名稱: row.line_name,
      電話: row.phone,
      Email: row.email ?? "",
      課程: row.classes?.course_types?.name ?? "",
      班級: row.classes?.title ?? "",
      星期: row.classes?.weekday ? weekdayLabel(row.classes.weekday) : "",
      時間: row.classes ? `${row.classes.start_time}-${row.classes.end_time}` : "",
      經驗: row.experience_level,
      借球拍: row.needs_paddle ? "是" : "否",
      狀態: row.status,
      備註: row.notes ?? "",
      登記時間: row.created_at
    }));
    return csvResponse("baoliang-registrations.csv", rows);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAdmin();
    const body = await request.json();
    const id = String(body.id ?? "");
    const status = String(body.status ?? "");
    const supabase = supabaseAdmin();
    const { data: row } = await supabase.from("registrations").select("class_id").eq("id", id).maybeSingle();
    const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    if (row?.class_id) await supabase.rpc("refresh_class_status", { target_class_id: row.class_id });
    await supabase.from("audit_logs").insert({ admin_user_id: user.id, action: "update_status", entity_type: "registrations", entity_id: id, metadata: body });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
