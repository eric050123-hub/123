import { AdminNav } from "@/components/AdminNav";
import { AdminStatusButton } from "@/components/AdminStatusButton";
import { LinkButton, StatusBadge } from "@/components/ui";
import { weekdayLabel } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = supabaseAdmin();
  let query = supabase.from("registrations").select("*, classes(title, weekday,start_time,end_time, course_types(name))").order("created_at", { ascending: false });
  if (params.status) query = query.eq("status", params.status);
  if (params.q) query = query.or(`full_name.ilike.%${params.q}%,phone.ilike.%${params.q}%,line_name.ilike.%${params.q}%`);
  const { data } = await query;

  return (
    <div className="min-h-screen bg-mist">
      <AdminNav />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-black">學員管理</h1>
          <LinkButton href="/api/admin/registrations" variant="secondary">匯出 CSV</LinkButton>
        </div>
        <form className="mt-5 grid gap-3 rounded-md bg-white p-4 shadow-soft md:grid-cols-3">
          <input name="q" defaultValue={params.q ?? ""} placeholder="搜尋姓名、電話、LINE" className="focus-ring min-h-12 rounded-md border border-ink/15 px-4" />
          <select name="status" defaultValue={params.status ?? ""} className="focus-ring min-h-12 rounded-md border border-ink/15 px-4"><option value="">全部狀態</option><option value="active">有效</option><option value="cancelled">已取消</option><option value="locked">已鎖定</option><option value="confirmed">已確認</option></select>
          <button className="rounded-md bg-leaf font-bold text-white">篩選</button>
        </form>
        <section className="mt-6 overflow-x-auto rounded-md bg-white p-5 shadow-soft">
          <table className="w-full min-w-[1100px] text-left">
            <thead><tr className="border-b"><Th>姓名</Th><Th>LINE</Th><Th>電話</Th><Th>年齡</Th><Th>性別</Th><Th>課程</Th><Th>時間</Th><Th>狀態</Th><Th>操作</Th></tr></thead>
            <tbody>
              {(data ?? []).length ? (data ?? []).map((r) => (
                <tr key={r.id} className="border-b border-ink/10">
                  <Td>{r.full_name}</Td><Td>{r.line_name}</Td><Td>{r.phone}</Td><Td>{r.age_group}</Td><Td>{r.experience_level}</Td><Td>{r.classes?.course_types?.name}<br /><span className="text-sm text-ink/60">{r.classes?.title}</span></Td><Td>{weekdayLabel(r.classes?.weekday)} {r.classes?.start_time}-{r.classes?.end_time}</Td><Td><StatusBadge status={r.status} /></Td><Td><div className="flex gap-2"><AdminStatusButton endpoint="/api/admin/registrations" id={r.id} status="cancelled" label="取消" /><AdminStatusButton endpoint="/api/admin/registrations" id={r.id} status="locked" label="鎖定" /></div></Td>
                </tr>
              )) : (
                <tr><Td colSpan={9}>目前沒有學員報名資料。</Td></tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="px-3 py-3 text-sm font-black text-ink/60">{children}</th>; }
function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) { return <td colSpan={colSpan} className="px-3 py-4 align-top">{children}</td>; }
