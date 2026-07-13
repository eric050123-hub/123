import { NextResponse } from "next/server";
import { cleanOptional, jsonError } from "@/lib/api";
import { hashPin } from "@/lib/crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { proposalSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const parsed = proposalSchema.parse(await request.json());
    const supabase = supabaseAdmin();

    const { data: duplicate, error: duplicateError } = await supabase
      .from("public_class_summaries")
      .select("id, title, course_name, weekday, start_time, end_time")
      .eq("course_type_id", parsed.courseTypeId)
      .eq("weekday", parsed.weekday)
      .eq("start_time", parsed.startTime)
      .eq("end_time", parsed.endTime)
      .in("status", ["recruiting", "threshold_reached"]);
    if (duplicateError) throw new Error(duplicateError.message);
    if (duplicate?.length && !parsed.forceSubmit) {
      return NextResponse.json({
        ok: false,
        duplicate: duplicate[0],
        message: "已有相同時段正在招生，建議直接加入。"
      });
    }

    const { data, error } = await supabase
      .from("class_proposals")
      .insert({
        course_type_id: parsed.courseTypeId,
        requested_weekday: parsed.weekday,
        requested_start_time: parsed.startTime,
        requested_end_time: parsed.endTime,
        requested_period: parsed.period,
        alternative_slots: parsed.alternativeSlots,
        applicant_name: parsed.applicantName.trim(),
        line_name: parsed.lineName.trim(),
        phone: parsed.phone,
        email: cleanOptional(parsed.email),
        experience_level: parsed.experienceLevel,
        notes: cleanOptional(parsed.notes),
        pin_hash: await hashPin(parsed.pin),
        status: "pending"
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    return jsonError(error);
  }
}
