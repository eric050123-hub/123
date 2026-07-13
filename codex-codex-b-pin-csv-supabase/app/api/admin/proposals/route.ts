import { NextResponse } from "next/server";
import { cleanOptional, jsonError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const adminUser = await requireAdmin();
    const body = await request.json();
    const supabase = supabaseAdmin();
    const id = String(body.id ?? "");
    const action = String(body.action ?? "");
    const adminNotes = cleanOptional(body.adminNotes);

    const { data: proposal, error } = await supabase
      .from("class_proposals")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!proposal) throw new Error("找不到提案。");

    if (action === "reject") {
      await supabase.from("class_proposals").update({ status: "rejected", admin_notes: adminNotes }).eq("id", id);
    } else if (action === "merge") {
      const classId = String(body.classId ?? "");
      if (!classId) throw new Error("請選擇要合併的班級。");
      const { error: regError } = await supabase.from("registrations").insert({
        class_id: classId,
        full_name: proposal.applicant_name,
        line_name: proposal.line_name,
        phone: proposal.phone,
        email: proposal.email,
        experience_level: proposal.experience_level,
        needs_paddle: false,
        notes: proposal.notes,
        pin_hash: proposal.pin_hash,
        status: "active"
      });
      if (regError) throw new Error(regError.message);
      await supabase.from("class_proposals").update({ status: "merged", approved_class_id: classId, admin_notes: adminNotes }).eq("id", id);
      await supabase.rpc("refresh_class_status", { target_class_id: classId });
    } else if (action === "approve") {
      const title = String(body.title ?? "").trim();
      const location = String(body.location ?? "").trim();
      if (!title || !location) throw new Error("請填寫班級名稱與場地。");
      const { data: klass, error: classError } = await supabase
        .from("classes")
        .insert({
          course_type_id: proposal.course_type_id,
          title,
          description: cleanOptional(body.description),
          weekday: Number(body.weekday ?? proposal.requested_weekday),
          start_time: String(body.startTime ?? proposal.requested_start_time),
          end_time: String(body.endTime ?? proposal.requested_end_time),
          period: String(body.period ?? proposal.requested_period),
          location,
          coach_name: cleanOptional(body.coachName),
          price: Number(body.price ?? 0),
          minimum_students: Number(body.minimumStudents ?? 4),
          maximum_students: Number(body.maximumStudents ?? 8),
          registration_deadline: cleanOptional(body.registrationDeadline),
          status: "recruiting",
          is_public: true,
          admin_notes: adminNotes,
          created_from_proposal_id: id
        })
        .select("id")
        .single();
      if (classError) throw new Error(classError.message);
      const { error: regError } = await supabase.from("registrations").insert({
        class_id: klass.id,
        full_name: proposal.applicant_name,
        line_name: proposal.line_name,
        phone: proposal.phone,
        email: proposal.email,
        experience_level: proposal.experience_level,
        needs_paddle: false,
        notes: proposal.notes,
        pin_hash: proposal.pin_hash,
        status: "active"
      });
      if (regError) throw new Error(regError.message);
      await supabase.from("class_proposals").update({ status: "approved", approved_class_id: klass.id, admin_notes: adminNotes }).eq("id", id);
      await supabase.rpc("refresh_class_status", { target_class_id: klass.id });
    } else {
      throw new Error("未知的提案操作。");
    }

    await supabase.from("audit_logs").insert({
      admin_user_id: adminUser.id,
      action,
      entity_type: "class_proposals",
      entity_id: id,
      metadata: body
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
