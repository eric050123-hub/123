import { LinkButton } from "@/components/ui";

export function SetupNotice() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-md border border-court bg-court/15 p-5">
        <h2 className="text-xl font-black">尚未連接 Supabase</h2>
        <p className="mt-2 text-ink/75">
          目前缺少 `.env.local`，所以先顯示空狀態。請依 README 填入 Supabase URL、Anon Key 與 Service Role Key 後重新啟動 dev server。
        </p>
        <div className="mt-4">
          <LinkButton href="/proposals/new" variant="secondary">先查看頁面結構</LinkButton>
        </div>
      </div>
    </section>
  );
}
