import { AdminClassForm } from "@/components/AdminClassForm";
import { AdminDeleteClassButton } from "@/components/AdminDeleteClassButton";
import { AdminNav } from "@/components/AdminNav";
import { AdminStatusButton } from "@/components/AdminStatusButton";
import { LinkButton, StatusBadge } from "@/components/ui";
import { weekdayLabel } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { AdminClass, CourseType } from "@/lib/types";

export const dynamic = "force-dynamic";

type ClassRow = AdminClass & {
  course_types?: { name: string } | null;
  registrations?: { status: string; party_size: number }[];
};

const STATUS_ORDER: Record<string, number> = {
  recruiting: 1,
  threshold_reached: 2,
  confirmed: 3,
  full: 4,
  draft: 5,
  closed: 8,
  completed: 9,
  cancelled: 10
};

export default async function AdminClassesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = supabaseAdmin();
  const [{ data: classes }, { data: courseTypes }] = await Promise.all([
    supabase
      .from("classes")
      .select("*, course_types(name), registrations(status, party_size)")
      .order("weekday")
      .order("start_time"),
    supabase.from("course_types").select("*").order("sort_order")
  ]);
  const rows = ((classes ?? []) as ClassRow[])
    .map((item) => {
      const activeCount = (item.registrations ?? [])
        .filter((r) => ["active", "confirmed"].includes(r.status))
        .reduce((sum, r) => sum + Number(r.party_size ?? 0), 0);

      return {
        ...item,
        course_name: item.course_types?.name ?? "",
        start_time: String(item.start_time).slice(0, 5),
        end_time: String(item.end_time).slice(0, 5),
        active_count: activeCount,
        seats_left: Math.max(item.maximum_students - activeCount, 0)
      };
    })
    .sort((a, b) => {
      const statusSort = (STATUS_ORDER[a.status] ?? 6) - (STATUS_ORDER[b.status] ?? 6);
      if (statusSort !== 0) return statusSort;
      if (a.weekday !== b.weekday) return a.weekday - b.weekday;
      return String(a.start_time).localeCompare(String(b.start_time));
    }) as AdminClass[];
  const editingClass = rows.find((item) => item.id === params.edit) ?? null;

  return (
    <div className="min-h-screen bg-mist">
      <AdminNav />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8">
        <h1 className="text-3xl font-black">班級管理</h1>
        <AdminClassForm key={editingClass?.id ?? "new"} courseTypes={(courseTypes ?? []) as CourseType[]} editingClass={editingClass} />
        <section className="rounded-md bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">班級列表</h2>
            <LinkButton href="/api/admin/registrations" variant="secondary">匯出全部 CSV</LinkButton>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead><tr className="border-b"><Th>班級</Th><Th>星期</Th><Th>時間</Th><Th>人數</Th><Th>狀態</Th><Th>操作</Th></tr></thead>
              <tbody>
                {rows.length ? rows.map((c) => (
                  <tr key={c.id} className="border-b border-ink/10">
                    <Td><b>{c.title}</b><br /><span className="text-sm text-ink/60">{c.course_name}</span></Td>
                    <Td>{weekdayLabel(c.weekday)}</Td>
                    <Td>{c.start_time}-{c.end_time}</Td>
                    <Td>{c.active_count}/{c.maximum_students}</Td>
                    <Td><StatusBadge status={c.status} /></Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        <LinkButton href={`/admin/classes?edit=${c.id}`} variant="secondary">修改</LinkButton>
                        <AdminStatusButton endpoint="/api/admin/classes" id={c.id} status="closed" label="暫停招生" />
                        <AdminStatusButton endpoint="/api/admin/classes" id={c.id} status="recruiting" label="恢復招生" />
                        <AdminStatusButton endpoint="/api/admin/classes" id={c.id} status="confirmed" label="正式開班" variant="primary" />
                        <AdminDeleteClassButton id={c.id} title={c.title} />
                      </div>
                    </Td>
                  </tr>
                )) : (
                  <tr><Td colSpan={6}>目前沒有班級。請先用上方表單新增一個班級。</Td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="px-3 py-3 text-sm font-black text-ink/60">{children}</th>; }
function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) { return <td colSpan={colSpan} className="px-3 py-4 align-top">{children}</td>; }
