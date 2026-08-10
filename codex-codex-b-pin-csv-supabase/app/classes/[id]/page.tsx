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
    <main className="min-h-screen bg-[#eef2f3] px-4 py-5 sm:px-5 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <LinkButton href="/" variant="ghost">← 回首頁</LinkButton>
      </div>
      <section className="mx-auto mt-4 max-w-3xl rounded-[24px] bg-white p-5 shadow-soft sm:rounded-[28px] sm:p-7">
        <div className="grid gap-3 sm:flex sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black leading-tight tracking-normal sm:text-5xl">{item.title}</h1>
            <p className="mt-3 text-lg font-semibold leading-relaxed text-ink/55 sm:mt-4 sm:text-2xl">
              {weekdayLabel(item.weekday)} {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
            </p>
          </div>
          <div className="justify-self-start sm:justify-self-auto">
            <StatusBadge status={item.status} />
          </div>
        </div>
        <div className="mt-5 rounded-3xl bg-[#f8fafb] p-5 sm:mt-7 sm:p-6">
          <Info label="地點" value={item.location ?? "確認中"} />
          <Info label="費用" value={item.price ? `$${item.price}` : "確認中"} />
          <Info label="備註" value={item.description ?? "報名前請確認時間與地點。"} />
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4">
          <BigInfo label="開班人數" value={`${item.minimum_students} 人`} />
          <BigInfo label="人數上限" value={`${item.maximum_students} 人`} />
          <BigInfo label="目前正取" value={`${item.active_count} 人`} />
          <BigInfo label="尚缺人數" value={`${Math.max(openingTarget - item.active_count, 0)} 人`} />
        </dl>
        <div className="mt-6">
          <ProgressBar value={openingProgress} />
          <p className="mt-3 text-base font-semibold text-ink/55 sm:text-lg">
            開班進度 {Math.min(item.active_count, openingTarget)}/{openingTarget} 人
          </p>
        </div>
      </section>

      <section className="mx-auto mt-5 max-w-3xl rounded-[24px] bg-white p-5 shadow-soft sm:mt-6 sm:rounded-[28px] sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black sm:text-3xl">登記名單</h2>
          <span className="shrink-0 rounded-full bg-emerald-50 px-4 py-2 text-lg font-black text-leaf sm:px-5 sm:text-xl">{item.active_count}/{item.maximum_students} 人</span>
        </div>
        <p className="mt-3 text-base font-semibold leading-relaxed text-ink/50 sm:text-lg">前台只顯示遮蔽姓氏，例如陳○○；完整資料僅管理員可看。</p>
        <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4">
          {registrations.length ? registrations.map((registration, index) => (
            <div key={registration.id} className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xl font-black sm:text-2xl">{index + 1}. {registration.masked_name}</p>
                <span className="shrink-0 rounded-full bg-white px-4 py-2 text-base font-black text-ink/70 sm:text-lg">{registration.party_size} 人</span>
              </div>
            </div>
          )) : (
            <div className="rounded-3xl border border-dashed border-ink/15 bg-[#f8fafb] p-5">
              <p className="text-xl font-black sm:text-2xl">目前尚無登記名單</p>
              <p className="mt-2 text-base font-semibold leading-relaxed text-ink/45 sm:text-lg">第一位學員報名後，這裡會顯示遮蔽姓名。</p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto mt-5 max-w-3xl rounded-[24px] bg-white p-5 shadow-soft sm:mt-6 sm:rounded-[28px] sm:p-7">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black sm:text-3xl">候補狀態</h2>
          <span className="rounded-full bg-amber-50 px-4 py-2 text-lg font-black text-amber-700 sm:px-5 sm:text-xl">0 組</span>
        </div>
        <p className="mt-4 text-lg font-semibold text-ink/45 sm:mt-5 sm:text-xl">尚無候補。</p>
      </section>

      <div className="sticky bottom-0 mx-auto mt-5 max-w-3xl bg-[#eef2f3]/90 py-4 backdrop-blur sm:mt-6">
        {item.status === "full" || item.status === "confirmed" ? (
          <div className="rounded-[24px] bg-white p-4 text-center text-lg font-black text-ink/45 shadow-soft sm:rounded-[28px] sm:p-5 sm:text-xl">
            此場次目前無法報名。
          </div>
        ) : (
          <LinkButton href={`/classes/${item.id}/register`} className="w-full rounded-[24px] bg-ink py-4 text-xl sm:rounded-[28px] sm:py-5 sm:text-2xl">
            我要報名
          </LinkButton>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="mb-5 last:mb-0"><dt className="text-base font-black text-ink/35 sm:text-lg">{label}</dt><dd className="mt-2 break-words text-lg font-bold leading-relaxed sm:text-xl">{value}</dd></div>;
}

function BigInfo({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-ink/10 p-4 sm:rounded-3xl sm:p-5"><dt className="text-sm font-black text-ink/35 sm:text-lg">{label}</dt><dd className="mt-2 text-2xl font-black sm:text-3xl">{value}</dd></div>;
}
