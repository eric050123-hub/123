import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = supabasePublic();
  let query = supabase
    .from("public_class_summaries")
    .select("*")
    .order("weekday")
    .order("start_time");

  const courseType = searchParams.get("courseType");
  const weekday = searchParams.get("weekday");
  const period = searchParams.get("period");
  if (courseType) query = query.eq("course_type_id", courseType);
  if (weekday) query = query.eq("weekday", Number(weekday));
  if (period) query = query.eq("period", period);

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}
