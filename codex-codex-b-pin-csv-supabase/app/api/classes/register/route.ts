import { NextResponse } from "next/server";
import { jsonError, cleanOptional } from "@/lib/api";
import { hashPin } from "@/lib/crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { registrationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registrationSchema.parse(body);
    const supabase = supabaseAdmin();

    const { data: klass, error: classError } = await supabase
      .from("public_class_summaries")
      .select("id, status, maximum_students, active_count")
      .eq("id", parsed.classId)
      .maybeSingle();
    if (classError) throw new Error(classError.message);
    if (!klass) throw new Error("找不到此班級或目前未公開招生。");
    if (["full", "closed", "completed", "cancelled"].includes(klass.status)) {
      throw new Error("此班級目前無法登記。");
    }
    if (klass.active_count >= klass.maximum_students || klass.active_count + parsed.partySize > klass.maximum_students) {
      throw new Error("此班級目前已額滿。");
    }
    const { data, error } = await supabase
      .from("registrations")
      .insert({
        class_id: parsed.classId,
        full_name: parsed.fullName.trim(),
        line_name: parsed.lineName?.trim() || parsed.fullName.trim(),
        phone: parsed.phone,
        email: cleanOptional(parsed.email),
        age_group: cleanOptional(parsed.ageGroup),
        experience_level: parsed.experienceLevel || "未填寫",
        needs_paddle: parsed.needsPaddle,
        party_size: parsed.partySize,
        notes: cleanOptional(parsed.notes),
        pin_hash: await hashPin(parsed.pin || parsed.phone),
        status: "active"
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabase.rpc("refresh_class_status", { target_class_id: parsed.classId });
    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    return jsonError(error);
  }
}
