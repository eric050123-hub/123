import { MyRegistrationClient } from "@/components/MyRegistrationClient";
import { LinkButton } from "@/components/ui";

export default function MyRegistrationPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <LinkButton href="/" variant="ghost">回首頁</LinkButton>
      <section className="mt-4 rounded-md bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-black">我的登記</h1>
        <p className="mt-2 text-ink/70">使用手機號碼查詢、修改或取消自己的登記。</p>
      </section>
      <section className="mt-5">
        <MyRegistrationClient />
      </section>
    </main>
  );
}
