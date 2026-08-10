"use client";

import { useState } from "react";
import { Button, Checkbox, ErrorState, Field, Input } from "@/components/ui";

export function PublicRegisterForm({ classId }: { classId: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/classes/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        classId,
        fullName: formData.get("fullName"),
        lineName: formData.get("fullName"),
        partySize: formData.get("partySize"),
        phone: formData.get("phone"),
        email: "",
        ageGroup: formData.get("age"),
        experienceLevel: formData.get("gender"),
        needsPaddle: false,
        notes: "",
        consent: formData.get("consent") === "on"
      })
    });
    const json = await res.json();
    setPending(false);
    if (!json.ok) return setError(json.message);
    setMessage("報名成功。之後可用手機號碼查詢、修改或取消。");
  }

  return (
    <form action={submit} className="grid gap-5 sm:gap-6">
      {message ? <div className="rounded-md bg-leaf/10 p-4 font-semibold text-leaf">{message}</div> : null}
      {error ? <ErrorState message={error} /> : null}
      <Field label="真實姓名" hint="前台只會顯示遮蔽姓氏，例如陳○○。">
        <Input name="fullName" placeholder="請輸入真實姓名" required className="rounded-[22px] px-5 py-4 text-lg sm:px-6 sm:py-5 sm:text-xl" />
      </Field>
      <Field label="手機號碼" hint="09 開頭，共 10 碼。日後修改或取消會用到。">
        <Input name="phone" inputMode="numeric" placeholder="09xxxxxxxx" required className="rounded-[22px] px-5 py-4 text-lg sm:px-6 sm:py-5 sm:text-xl" />
      </Field>
      <Field label="年齡">
        <Input name="age" type="number" min="1" max="120" placeholder="請輸入年齡" required className="rounded-[22px] px-5 py-4 text-lg sm:px-6 sm:py-5 sm:text-xl" />
      </Field>
      <Field label="性別">
        <select name="gender" required className="focus-ring min-h-12 w-full rounded-[22px] border border-ink/15 bg-white px-5 py-4 text-lg sm:px-6 sm:py-5 sm:text-xl">
          <option value="">請選擇</option>
          <option value="男">男</option>
          <option value="女">女</option>
          <option value="不透露">不透露</option>
        </select>
      </Field>
      <Field label="報名人數">
        <Input name="partySize" type="number" min="1" max="8" defaultValue="1" required className="rounded-[22px] px-5 py-4 text-lg sm:px-6 sm:py-5 sm:text-xl" />
      </Field>
      <Checkbox name="consent" required label="我同意個人資料僅供寶亮生活學苑聯絡與開班使用，不會公開顯示。" />
      <Button disabled={pending} className="rounded-[24px] bg-ink py-4 text-xl sm:rounded-[28px] sm:py-5 sm:text-2xl">{pending ? "送出中..." : "送出報名"}</Button>
    </form>
  );
}
