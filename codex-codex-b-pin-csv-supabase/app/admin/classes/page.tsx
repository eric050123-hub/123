import { AdminClassForm } from "@/components/AdminClassForm";
import { AdminNav } from "@/components/AdminNav";
import { AdminStatusButton } from "@/components/AdminStatusButton";
import { LinkButton, StatusBadge } from "@/components/ui";
import { weekdayLabel } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { CourseType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
  await requireAdmin();
  const supabase = supabaseAdmin();
  const [{ data: classes }, { data: courseTypes }] = await Promise.all([
    supabase.from("public_class_summaries").select("*").order("weekday"),
    supabase.from("course_types").select("*").order("sort_order")
  ]);

  return (
    <div className="min-h-screen bg-mist">
      <AdminNav />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8">
        <h1 className="text-3xl font-black">班級管理</h1>
        <AdminClassForm courseTypes={(courseTypes ?? []) as CourseType[]} />
        <section className="rounded-md bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">班級列表</h2>
            <LinkButton href="/api/admin/registrations" variant="secondary">匯出全部 CSV</LinkButton>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead><tr className="border-b"><Th>班級</Th><Th>星期</Th><Th>時間</Th><Th>人數</Th><Th>狀態</Th><Th>操作</Th></tr></thead>
              <tbody>
                {(classes ?? []).length ? (classes ?? []).map((c) => (
                  <tr key={c.id} className="border-b border-ink/10">
                    <Td><b>{c.title}</b><br /><span className="text-sm text-ink/60">{c.course_name}</span></Td>
                    <Td>{weekdayLabel(c.weekday)}</Td>
                    <Td>{c.start_time}-{c.end_time}</Td>
                    <Td>{c.active_count}/{c.maximum_students}</Td>
                    <Td><StatusBadge status={c.status} /></Td>
                    <Td><div className="flex flex-wrap gap-2"><AdminStatusButton endpoint="/api/admin/classes" id={c.id} status="closed" label="暫停招生" /><AdminStatusButton endpoint="/api/admin/classes" id={c.id} status="recruiting" label="恢復招生" /><AdminStatusButton endpoint="/api/admin/classes" id={c.id} status="confirmed" label="正式開班" variant="primary" /></div></Td>
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
