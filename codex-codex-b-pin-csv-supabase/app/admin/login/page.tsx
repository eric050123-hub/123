import { redirect } from "next/navigation";
import { Button, ErrorState, Field, Input } from "@/components/ui";
import { getAdminUser, signInAdmin } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminUser()) redirect("/admin");
  const params = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const result = await signInAdmin(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
    if (!result.ok) redirect(`/admin/login?error=${encodeURIComponent(result.message)}`);
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form action={login} className="grid w-full max-w-md gap-5 rounded-md bg-white p-6 shadow-soft">
        <div>
          <p className="font-bold text-leaf">寶亮生活學苑</p>
          <h1 className="mt-1 text-3xl font-black">管理員登入</h1>
        </div>
        {params.error ? <ErrorState message={params.error} /> : null}
        <Field label="Email"><Input name="email" type="email" required /></Field>
        <Field label="Password"><Input name="password" type="password" required /></Field>
        <Button>登入</Button>
        <p className="text-sm text-ink/60">忘記密碼請由 Supabase Auth 後台寄送重設信，或聯絡系統管理員。</p>
      </form>
    </main>
  );
}
