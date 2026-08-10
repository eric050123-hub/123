import { NextResponse } from "next/server";
import { cleanOptional, jsonError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { adminClassSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    const parsed = adminClassSchema.parse(await request.json());
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("classes")
      .insert({
        course_type_id: parsed.courseTypeId,
        title: parsed.title,
        description: cleanOptional(parsed.description),
        weekday: parsed.weekday,
        period: parsed.period,
        start_time: parsed.startTime,
        end_time: parsed.endTime,
        location: parsed.location,
        coach_name: cleanOptional(parsed.coachName),
        price: parsed.price ?? 0,
        minimum_students: parsed.minimumStudents,
        maximum_students: parsed.maximumStudents,
        registration_deadline: cleanOptional(parsed.registrationDeadline),
        status: parsed.status,
        is_public: parsed.isPublic,
        admin_notes: cleanOptional(parsed.adminNotes)
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await supabase.from("audit_logs").insert({ admin_user_id: user.id, action: "create", entity_type: "classes", entity_id: data.id });
    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAdmin();
    const body = await request.json();
    const id = String(body.id ?? "");
    const action = String(body.action ?? "update");
    const supabase = supabaseAdmin();

    if (action === "status") {
      const status = String(body.status ?? "");
      const { error } = await supabase.from("classes").update({ status }).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const parsed = adminClassSchema.parse(body);
      const { error } = await supabase
        .from("classes")
        .update({
          course_type_id: parsed.courseTypeId,
          title: parsed.title,
          description: cleanOptional(parsed.description),
          weekday: parsed.weekday,
          period: parsed.period,
          start_time: parsed.startTime,
          end_time: parsed.endTime,
          location: parsed.location,
          coach_name: cleanOptional(parsed.coachName),
          price: parsed.price ?? 0,
          minimum_students: parsed.minimumStudents,
          maximum_students: parsed.maximumStudents,
          registration_deadline: cleanOptional(parsed.registrationDeadline),
          status: parsed.status,
          is_public: parsed.isPublic,
          admin_notes: cleanOptional(parsed.adminNotes)
        })
        .eq("id", id);
      if (error) throw new Error(error.message);
    }

    await supabase.from("audit_logs").insert({ admin_user_id: user.id, action, entity_type: "classes", entity_id: id, metadata: body });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAdmin();
    const body = await request.json();
    const id = String(body.id ?? "");
    if (!id) throw new Error("缺少班級 ID。");

    const supabase = supabaseAdmin();
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({ admin_user_id: user.id, action: "delete", entity_type: "classes", entity_id: id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
