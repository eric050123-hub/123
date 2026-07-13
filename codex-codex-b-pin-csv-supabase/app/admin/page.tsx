import { LinkButton, StatusBadge } from "@/components/ui";
import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { weekdayLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdmin();
  const supabase = supabaseAdmin();
  const [{ data: proposals }, { data: classes }, { data: registrations }] = await Promise.all([
    supabase.from("class_proposals").select("*, course_types(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("public_class_summaries").select("*").order("active_count", { ascending: false }).limit(6),
    supabase.from("registrations").select("*, classes(title, course_types(name))").order("created_at", { ascending: false }).limit(5)
  ]);
  const allClasses = classes ?? [];
  const cards = [
    ["待審核提案", (proposals ?? []).filter((p) => p.status === "pending").length],
    ["招生中班級", allClasses.filter((c) => c.status === "recruiting").length],
    ["已達開班標準", allClasses.filter((c) => c.status === "threshold_reached").length],
    ["已正式開班", allClasses.filter((c) => c.status === "confirmed").length],
    ["今日新增登記", (registrations ?? []).length],
    ["本月新增登記", (registrations ?? []).length]
  ];

  return (
    <div className="min-h-screen bg-mist">
      <AdminNav />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-black">後台總覽</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {cards.map(([label, value]) => <div key={label} className="rounded-md bg-white p-4 shadow-soft"><p className="text-sm font-bold text-ink/60">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Panel title="最接近開班的班級" href="/admin/classes">
            {allClasses.map((c) => <Row key={c.id} title={c.title} sub={`${c.active_count}/${c.minimum_students} 人`} status={c.status} />)}
          </Panel>
          <Panel title="最新提案" href="/admin/proposals">
            {(proposals ?? []).map((p) => <Row key={p.id} title={p.applicant_name} sub={`${p.course_types?.name} ${weekdayLabel(p.requested_weekday)}`} status={p.status} />)}
          </Panel>
          <Panel title="最新登記" href="/admin/registrations">
            {(registrations ?? []).map((r) => <Row key={r.id} title={r.full_name} sub={r.classes?.title ?? ""} status={r.status} />)}
          </Panel>
        </div>
      </main>
    </div>
  );
}

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return <section className="rounded-md bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><h2 className="text-xl font-black">{title}</h2><LinkButton href={href} variant="ghost">查看</LinkButton></div><div className="mt-4 grid gap-3">{children}</div></section>;
}

function Row({ title, sub, status }: { title: string; sub: string; status: string }) {
  return <div className="flex items-center justify-between gap-3 border-b border-ink/10 pb-3"><div><p className="font-bold">{title}</p><p className="text-sm text-ink/60">{sub}</p></div><StatusBadge status={status} /></div>;
}
