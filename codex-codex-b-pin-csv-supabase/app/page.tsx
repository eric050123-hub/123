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
      <section className="mx-auto max-w-3xl px-5 pt-8">
        <div className="rounded-[28px] bg-white p-8 shadow-soft">
          <p className="text-sm font-black tracking-[0.45em] text-ink/35">BAOLIANG LIFE ACADEMY</p>
          <h1 className="mt-5 text-5xl font-black tracking-normal">寶亮匹克球預開班</h1>
          <p className="mt-4 text-xl font-semibold leading-relaxed text-ink/55">
            選好想上的課程，填寫姓名、手機與人數即可登記。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-3xl font-black">開放登記場次</h2>
          <span className="rounded-full bg-white px-5 py-3 text-lg font-black text-ink/65">{classes.length} 場</span>
        </div>
        <div className="grid gap-6">
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
