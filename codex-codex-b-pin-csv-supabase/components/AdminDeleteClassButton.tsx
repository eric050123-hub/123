"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function AdminDeleteClassButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();

  async function click() {
    const ok = window.confirm(`確定要刪除「${title}」嗎？刪除後此班級與相關報名資料會一起移除。`);
    if (!ok) return;

    const res = await fetch("/api/admin/classes", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id })
    });
    const json = await res.json();
    if (!json.ok) {
      window.alert(json.message ?? "刪除失敗");
      return;
    }
    router.refresh();
  }

  return (
    <Button type="button" variant="danger" onClick={click}>
      刪除
    </Button>
  );
}
