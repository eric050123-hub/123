import Link from "next/link";
import { signOutAdmin } from "@/lib/auth";

const links = [
  ["/admin", "總覽"],
  ["/admin/proposals", "提案審核"],
  ["/admin/classes", "班級管理"],
  ["/admin/registrations", "學員管理"],
  ["/admin/course-types", "課程類型"],
  ["/admin/settings", "系統設定"]
];

export function AdminNav() {
  async function logout() {
    "use server";
    await signOutAdmin();
  }

  return (
    <header className="border-b border-ink/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/admin" className="text-xl font-black text-leaf">
          寶亮後台
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-2 font-semibold text-ink/75 hover:bg-mist">
              {label}
            </Link>
          ))}
          <form action={logout}>
            <button className="rounded-md px-3 py-2 font-semibold text-clay hover:bg-clay/10">登出</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
