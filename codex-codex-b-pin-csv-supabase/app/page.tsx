import { ClassCard } from "@/components/ClassCard";
import { EmptyState } from "@/components/ui";
import { demoClasses } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { supabasePublic } from "@/lib/supabase";
import type { PublicClass } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  let classes: PublicClass[] = [];

  if (hasSupabaseEnv()) {
    const supabase = supabasePublic();
    let query = supabase.from("public_class_summaries").select("*").order("weekday").order("start_time");
    if (params.weekday) query = query.eq("weekday", Number(params.weekday));
    const classResult = await query;
    classes = (classResult.data ?? []) as PublicClass[];
  } else {
    classes = demoClasses;
  }

  return (
    <main className="min-h-screen bg-[#eef2f3]">
      <section className="mx-auto max-w-3xl px-4 pt-5 sm:px-5 sm:pt-8">
        <div className="rounded-[24px] bg-white p-6 shadow-soft sm:rounded-[28px] sm:p-8">
          <p className="text-xs font-black tracking-[0.28em] text-ink/35 sm:text-sm sm:tracking-[0.45em]">BAOLIANG LIFE ACADEMY</p>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-normal sm:mt-5 sm:text-5xl">寶亮匹克球預開班</h1>
          <p className="mt-3 text-base font-semibold leading-relaxed text-ink/55 sm:mt-4 sm:text-xl">
            選好想上的課程，填寫姓名、手機與人數即可登記。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black sm:text-3xl">開放登記場次</h2>
          <span className="rounded-full bg-white px-4 py-2 text-base font-black text-ink/65 sm:px-5 sm:py-3 sm:text-lg">{classes.length} 場</span>
        </div>
        <div className="grid gap-4 sm:gap-6">
          {classes.length ? (
            classes.map((item) => <ClassCard key={item.id} item={item} />)
          ) : (
            <EmptyState title="目前沒有場次" text="新增場次後會出現在這裡。" />
          )}
        </div>
      </section>
    </main>
  );
}
