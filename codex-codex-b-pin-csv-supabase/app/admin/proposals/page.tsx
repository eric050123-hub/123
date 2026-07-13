import { ProposalAdminActions } from "@/components/ProposalAdminActions";
import { AdminNav } from "@/components/AdminNav";
import { StatusBadge } from "@/components/ui";
import { weekdayLabel } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminProposalsPage() {
  await requireAdmin();
  const supabase = supabaseAdmin();
  const [{ data: proposals }, { data: classes }] = await Promise.all([
    supabase.from("class_proposals").select("*, course_types(name)").order("created_at", { ascending: false }),
    supabase.from("public_class_summaries").select("id,title,course_name,weekday,start_time,end_time").order("weekday")
  ]);

  return (
    <div className="min-h-screen bg-mist">
      <AdminNav />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-black">提案審核</h1>
        <div className="mt-6 grid gap-4">
          {(proposals ?? []).map((p) => (
            <section key={p.id} className="rounded-md bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-bold text-leaf">{p.course_types?.name}</p>
                  <h2 className="text-2xl font-black">{weekdayLabel(p.requested_weekday)} {p.requested_start_time}-{p.requested_end_time}</h2>
                  <p className="mt-2 text-ink/70">{p.applicant_name}｜{p.phone}｜LINE：{p.line_name}</p>
                  <p className="mt-2 text-ink/70">可接受其他時段：{Array.isArray(p.alternative_slots) ? p.alternative_slots.join("、") : "未填"}</p>
                  <p className="mt-2 text-ink/70">備註：{p.notes ?? "無"}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              {p.status === "pending" ? <ProposalAdminActions proposal={p} classes={classes ?? []} /> : null}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
