import { ProposalForm } from "@/components/ProposalForm";
import { LinkButton } from "@/components/ui";
import { hasSupabaseEnv } from "@/lib/env";
import { supabasePublic } from "@/lib/supabase";
import type { CourseType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewProposalPage() {
  const { data } = hasSupabaseEnv()
    ? await supabasePublic()
        .from("course_types")
        .select("id,name,description,is_active,sort_order")
        .eq("is_active", true)
        .order("sort_order")
    : { data: [] };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <LinkButton href="/" variant="ghost">回首頁</LinkButton>
      <section className="mt-4 rounded-md bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-black">提出新的開班時段</h1>
        <p className="mt-2 text-ink/70">新時段會先進入待審核，管理員確認場地與教練後才會公開招生。</p>
      </section>
      <section className="mt-5 rounded-md bg-white p-6 shadow-soft">
        {hasSupabaseEnv() ? (
          <ProposalForm courseTypes={(data ?? []) as CourseType[]} />
        ) : (
          <p className="rounded-md bg-court/15 p-4 font-semibold">尚未設定 Supabase，請先建立 `.env.local` 後再送出提案。</p>
        )}
      </section>
    </main>
  );
}
