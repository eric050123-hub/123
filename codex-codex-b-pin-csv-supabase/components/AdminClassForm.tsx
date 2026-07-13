"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PERIODS, TIME_SLOTS, WEEKDAYS } from "@/lib/constants";
import type { CourseType } from "@/lib/types";
import { Button, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";

export function AdminClassForm({ courseTypes }: { courseTypes: CourseType[] }) {
  const router = useRouter();
  const [period, setPeriod] = useState<"morning" | "afternoon" | "evening">("morning");
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    const slot = String(formData.get("slot")).split("|");
    const res = await fetch("/api/admin/classes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        courseTypeId: formData.get("courseTypeId"),
        title: formData.get("title"),
        description: formData.get("description"),
        weekday: formData.get("weekday"),
        period,
        startTime: slot[0],
        endTime: slot[1],
        location: formData.get("location"),
        coachName: formData.get("coachName"),
        price: formData.get("price"),
        minimumStudents: formData.get("minimumStudents"),
        maximumStudents: formData.get("maximumStudents"),
        registrationDeadline: formData.get("registrationDeadline"),
        status: formData.get("status"),
        isPublic: formData.get("isPublic") === "on",
        adminNotes: formData.get("adminNotes")
      })
    });
    const json = await res.json();
    if (!json.ok) return setError(json.message);
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-4 rounded-md bg-white p-5 shadow-soft md:grid-cols-2">
      <h2 className="text-xl font-black md:col-span-2">新增班級</h2>
      {error ? <p className="rounded-md bg-clay/10 p-3 font-bold text-clay md:col-span-2">{error}</p> : null}
      <Field label="課程類型"><Select name="courseTypeId">{courseTypes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
      <Field label="班級名稱"><Input name="title" required /></Field>
      <Field label="星期"><Select name="weekday">{WEEKDAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</Select></Field>
      <Field label="時段區間"><Select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>{PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</Select></Field>
      <Field label="時段"><Select name="slot">{TIME_SLOTS[period].map((s) => <option key={s.label} value={`${s.start}|${s.end}`}>{s.label}</option>)}</Select></Field>
      <Field label="場地"><Input name="location" required /></Field>
      <Field label="教練"><Input name="coachName" /></Field>
      <Field label="費用"><Input name="price" type="number" defaultValue="0" /></Field>
      <Field label="最低開班人數"><Input name="minimumStudents" type="number" defaultValue="4" /></Field>
      <Field label="最高人數"><Input name="maximumStudents" type="number" defaultValue="8" /></Field>
      <Field label="招生截止日"><Input name="registrationDeadline" type="date" /></Field>
      <Field label="狀態"><Select name="status" defaultValue="recruiting"><option value="draft">草稿</option><option value="recruiting">招生中</option></Select></Field>
      <Field label="課程說明"><Textarea name="description" /></Field>
      <Field label="管理員備註"><Textarea name="adminNotes" /></Field>
      <Checkbox name="isPublic" defaultChecked label="公開到前台" />
      <div className="md:col-span-2"><Button>新增班級</Button></div>
    </form>
  );
}
