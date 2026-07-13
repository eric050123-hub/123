"use client";

import { useState } from "react";
import { Button, Checkbox, Field, Input } from "@/components/ui";

export function DemoRegisterForm({ classId }: { classId: string }) {
  const [message, setMessage] = useState("");

  function submit(formData: FormData) {
    const saved = JSON.parse(localStorage.getItem("baoliang-demo-registrations") ?? "[]");
    saved.push({
      classId,
      fullName: formData.get("fullName"),
      lineName: formData.get("fullName"),
      partySize: formData.get("partySize"),
      phone: formData.get("phone"),
      ageGroup: formData.get("age"),
      experienceLevel: formData.get("gender"),
      createdAt: new Date().toISOString()
    });
    localStorage.setItem("baoliang-demo-registrations", JSON.stringify(saved));
    setMessage("預覽報名成功。正式上線接 Supabase 後，這筆資料會寫入資料庫並出現在管理後台。");
  }

  return (
    <form action={submit} className="grid gap-6">
      {message ? <div className="rounded-3xl bg-leaf/10 p-5 text-lg font-bold text-leaf">{message}</div> : null}
      <Field label="真實姓名">
        <Input name="fullName" placeholder="請輸入真實姓名" required className="rounded-[22px] px-6 py-5 text-xl" />
      </Field>
      <Field label="手機號碼">
        <Input name="phone" inputMode="numeric" placeholder="09xxxxxxxx" required className="rounded-[22px] px-6 py-5 text-xl" />
      </Field>
      <Field label="年齡">
        <Input name="age" type="number" min="1" max="120" placeholder="請輸入年齡" required className="rounded-[22px] px-6 py-5 text-xl" />
      </Field>
      <Field label="性別">
        <select name="gender" required className="focus-ring min-h-12 w-full rounded-[22px] border border-ink/15 bg-white px-6 py-5 text-xl">
          <option value="">請選擇</option>
          <option value="男">男</option>
          <option value="女">女</option>
          <option value="不透露">不透露</option>
        </select>
      </Field>
      <Field label="報名人數">
        <Input name="partySize" type="number" min="1" max="8" defaultValue="1" required className="rounded-[22px] px-6 py-5 text-xl" />
      </Field>
      <Checkbox name="consent" required label="我同意個人資料僅供寶亮生活學苑聯絡與開班使用，不會公開顯示。" />
      <Button className="rounded-[28px] bg-ink py-5 text-2xl">送出預覽報名</Button>
    </form>
  );
}
