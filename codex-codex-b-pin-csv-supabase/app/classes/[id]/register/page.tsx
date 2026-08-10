import { notFound } from "next/navigation";
import { DemoRegisterForm } from "@/components/DemoRegisterForm";
import { PublicRegisterForm } from "@/components/PublicRegisterForm";
import { LinkButton } from "@/components/ui";
import { weekdayLabel } from "@/lib/constants";
import { demoClasses } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { supabasePublic } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = hasSupabaseEnv()
    ? await supabasePublic().from("public_class_summaries").select("*").eq("id", id).maybeSingle()
    : { data: demoClasses.find((klass) => klass.id === id) ?? null };
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-[#eef2f3] px-4 py-5 sm:px-5 sm:py-8">
      <div className="mx-auto max-w-3xl">
      <LinkButton href={`/classes/${id}`} variant="ghost">← 回班級詳情</LinkButton>
      <section className="mt-4 rounded-[24px] bg-white p-5 shadow-soft sm:rounded-[28px] sm:p-7">
        <p className="text-xs font-black tracking-[0.28em] text-ink/35 sm:text-sm sm:tracking-[0.5em]">REGISTRATION</p>
        <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">我要報名</h1>
        <p className="mt-3 text-lg font-semibold leading-relaxed text-ink/55 sm:mt-4 sm:text-2xl">
          <span className="block break-words">{data.title}</span>
          <span className="mt-1 block">{weekdayLabel(data.weekday)} {data.start_time.slice(0, 5)}-{data.end_time.slice(0, 5)}</span>
        </p>
      </section>
      <section className="mt-5 rounded-[24px] bg-white p-5 shadow-soft sm:rounded-[28px] sm:p-7">
        {hasSupabaseEnv() ? (
          <PublicRegisterForm classId={id} />
        ) : (
          <DemoRegisterForm classId={id} />
        )}
      </section>
      </div>
    </main>
  );
}
