"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Checkbox, Field, Input, Textarea } from "@/components/ui";

export function CourseTypeManager({ items }: { items: any[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function create(formData: FormData) {
    setError("");
    const res = await fetch("/api/admin/course-types", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description"),
        sortOrder: formData.get("sortOrder"),
        isActive: formData.get("isActive") === "on"
      })
    });
    const json = await res.json();
    if (!json.ok) return setError(json.message);
    router.refresh();
  }

  async function toggle(item: any) {
    await fetch("/api/admin/course-types", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...item, sortOrder: item.sort_order, isActive: !item.is_active })
    });
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <form action={create} className="grid gap-4 rounded-md bg-white p-5 shadow-soft md:grid-cols-2">
        <h2 className="text-xl font-black md:col-span-2">新增課程類型</h2>
        {error ? <p className="text-clay md:col-span-2">{error}</p> : null}
        <Field label="名稱"><Input name="name" required /></Field>
        <Field label="排序"><Input name="sortOrder" type="number" defaultValue="99" /></Field>
        <Field label="說明"><Textarea name="description" /></Field>
        <Checkbox name="isActive" defaultChecked label="啟用" />
        <div className="md:col-span-2"><Button>新增</Button></div>
      </form>
      <section className="rounded-md bg-white p-5 shadow-soft">
        <h2 className="text-xl font-black">課程類型列表</h2>
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 border-b border-ink/10 pb-3">
              <div><p className="font-bold">{item.sort_order}. {item.name}</p><p className="text-sm text-ink/60">{item.description}</p></div>
              <Button type="button" variant="secondary" onClick={() => toggle(item)}>{item.is_active ? "停用" : "啟用"}</Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
