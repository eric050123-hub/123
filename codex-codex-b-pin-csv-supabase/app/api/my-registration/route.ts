import { NextResponse } from "next/server";
import { cleanOptional, jsonError } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase";
import { lookupSchema, updateOwnRegistrationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const parsed = lookupSchema.parse(await request.json());
    const supabase = supabaseAdmin();
    const [registrations, proposals] = await Promise.all([
      supabase
        .from("registrations")
        .select("id, class_id, full_name, line_name, phone, email, notes, status, created_at, classes(title, weekday,start_time,end_time, status, course_types(name))")
        .eq("phone", parsed.phone)
        .order("created_at", { ascending: false }),
      supabase
        .from("class_proposals")
        .select("id, applicant_name, line_name, phone, email, notes, status, created_at, requested_weekday, requested_start_time, requested_end_time, course_types(name)")
        .eq("phone", parsed.phone)
        .order("created_at", { ascending: false })
    ]);
    if (registrations.error) throw new Error(registrations.error.message);
    if (proposals.error) throw new Error(proposals.error.message);

    return NextResponse.json({ ok: true, registrations: registrations.data ?? [], proposals: proposals.data ?? [] });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const parsed = updateOwnRegistrationSchema.parse(await request.json());
    const supabase = supabaseAdmin();
    const table = parsed.type === "registration" ? "registrations" : "class_proposals";
    const selectCols = "id, phone, status";
    const { data: row, error } = await supabase.from(table).select(selectCols).eq("id", parsed.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row || row.phone !== parsed.phone) {
      throw new Error("手機號碼不正確。");
    }
    if (parsed.type === "registration" && ["locked", "confirmed"].includes(row.status)) {
      throw new Error("此登記已開班或鎖定，無法自行修改。");
    }
    if (parsed.type === "proposal" && row.status !== "pending") {
      throw new Error("只有待審核提案可自行修改。");
    }

    const { error: updateError } = await supabase
      .from(table)
      .update({ line_name: parsed.lineName, email: cleanOptional(parsed.email), notes: cleanOptional(parsed.notes) })
      .eq("id", parsed.id);
    if (updateError) throw new Error(updateError.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const type = body.type === "proposal" ? "proposal" : "registration";
    const phone = String(body.phone ?? "");
    const id = String(body.id ?? "");
    const credentials = lookupSchema.parse({ phone });
    const supabase = supabaseAdmin();
    const table = type === "registration" ? "registrations" : "class_proposals";
    const selectCols = type === "registration" ? "id, phone, status, class_id" : "id, phone, status";
    const { data: rowData, error } = await supabase.from(table).select(selectCols).eq("id", id).maybeSingle();
    const row = rowData as null | {
      id: string;
      phone: string;
      status: string;
      class_id?: string;
    };
    if (error) throw new Error(error.message);
    if (!row || row.phone !== credentials.phone) {
      throw new Error("手機號碼不正確。");
    }
    if (type === "registration" && ["locked", "confirmed"].includes(row.status)) {
      throw new Error("此登記已開班或鎖定，無法自行取消。");
    }
    if (type === "proposal" && row.status !== "pending") {
      throw new Error("只有待審核提案可自行取消。");
    }
    const { error: cancelError } = await supabase.from(table).update({ status: "cancelled" }).eq("id", id);
    if (cancelError) throw new Error(cancelError.message);
    if (type === "registration" && "class_id" in row && row.class_id) {
      await supabase.rpc("refresh_class_status", { target_class_id: row.class_id });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
