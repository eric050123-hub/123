import { notFound } from "next/navigation";
import { LinkButton, ProgressBar, StatusBadge } from "@/components/ui";
import { weekdayLabel } from "@/lib/constants";
import { demoClasses, demoMaskedRegistrations } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { supabasePublic } from "@/lib/supabase";
import type { PublicClass, PublicRegistrationName } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClassDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item: PublicClass | null = null;
  let registrations: PublicRegistrationName[] = [];

  if (hasSupabaseEnv()) {
    const supabase = supabasePublic();
    const [{ data: classData }, { data: registrationData }] = await Promise.all([
      supabase.from("public_class_summaries").select("*").eq("id", id).maybeSingle(),
      supabase.from("public_registration_masked_names").select("*").eq("class_id", id).order("created_at")
    ]);
    item = classData as PublicClass | null;
    registrations = (registrationData ?? []) as PublicRegistrationName[];
  } else {
    item = demoClasses.find((klass) => klass.id === id) ?? null;
    registrations = id === "demo-1" ? demoMaskedRegistrations : demoMaskedRegistrations.slice(0, 3);
  }

  if (!item) notFound();
  const openingTarget = Math.max(item.minimum_students, 1);
  const openingProgress = (item.active_count / openingTarget) * 100;

  return (
    <main className="min-h-screen bg-[#eef2f3] px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <LinkButton href="/" variant="ghost">← 回首頁</LinkButton>
      </div>
      <section className="mx-auto mt-4 max-w-3xl rounded-[28px] bg-white p-7 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-5xl font-black tracking-normal">{item.title}</h1>
            <p className="mt-4 text-2xl font-semibold text-ink/55">
              {weekdayLabel(item.weekday)}　{item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
            </p>
          </div>
          <StatusBadge status={item.status} />
        </div>
        <div className="mt-7 rounded-3xl bg-[#f8fafb] p-6">
          <Info label="地點" value={item.location ?? "確認中"} />
          <Info label="費用" value={item.price ? `$${item.price}` : "確認中"} />
          <Info label="備註" value={item.description ?? "報名前請確認時間與地點。"} />
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4">
          <BigInfo label="開班人數" value={`${item.minimum_students} 人`} />
          <BigInfo label="人數上限" value={`${item.maximum_students} 人`} />
          <BigInfo label="目前正取" value={`${item.active_count} 人`} />
          <BigInfo label="尚缺人數" value={`${Math.max(openingTarget - item.active_count, 0)} 人`} />
        </dl>
        <div className="mt-6">
          <ProgressBar value={openingProgress} />
          <p className="mt-3 text-lg font-semibold text-ink/55">
            開班進度 {Math.min(item.active_count, openingTarget)}/{openingTarget} 人
          </p>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-3xl rounded-[28px] bg-white p-7 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black">登記名單</h2>
          <span className="rounded-full bg-emerald-50 px-5 py-2 text-xl font-black text-leaf">{item.active_count}/{item.maximum_students} 人</span>
        </div>
        <p className="mt-3 text-lg font-semibold text-ink/50">前台只顯示遮蔽姓氏，例如陳○○；完整資料僅管理員可看。</p>
        <div className="mt-5 grid gap-4">
          {registrations.length ? registrations.map((registration, index) => (
            <div key={registration.id} className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black">{index + 1}. {registration.masked_name}</p>
                <span className="rounded-full bg-white px-4 py-2 text-lg font-black text-ink/70">{registration.party_size} 人</span>
              </div>
            </div>
          )) : (
            <div className="rounded-3xl border border-dashed border-ink/15 bg-[#f8fafb] p-5">
              <p className="text-2xl font-black">目前尚無登記名單</p>
              <p className="mt-2 text-lg font-semibold text-ink/45">第一位學員報名後，這裡會顯示遮蔽姓名。</p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-3xl rounded-[28px] bg-white p-7 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black">候補狀態</h2>
          <span className="rounded-full bg-amber-50 px-5 py-2 text-xl font-black text-amber-700">0 組</span>
        </div>
        <p className="mt-5 text-xl font-semibold text-ink/45">尚無候補。</p>
      </section>

      <div className="sticky bottom-0 mx-auto mt-6 max-w-3xl bg-[#eef2f3]/90 py-4 backdrop-blur">
        {item.status === "full" || item.status === "confirmed" ? (
          <div className="rounded-[28px] bg-white p-5 text-center text-xl font-black text-ink/45 shadow-soft">
            此場次目前無法報名。
          </div>
        ) : (
          <LinkButton href={`/classes/${item.id}/register`} className="w-full rounded-[28px] bg-ink py-5 text-2xl">
            我要報名
          </LinkButton>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="mb-5 last:mb-0"><dt className="text-lg font-black text-ink/35">{label}</dt><dd className="mt-2 text-xl font-bold leading-relaxed">{value}</dd></div>;
}

function BigInfo({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl border border-ink/10 p-5"><dt className="text-lg font-black text-ink/35">{label}</dt><dd className="mt-2 text-3xl font-black">{value}</dd></div>;
}
