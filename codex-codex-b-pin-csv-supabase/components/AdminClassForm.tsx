"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PERIODS, TIME_SLOTS, WEEKDAYS } from "@/lib/constants";
import type { AdminClass, CourseType } from "@/lib/types";
import { Button, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";

export function AdminClassForm({ courseTypes, editingClass }: { courseTypes: CourseType[]; editingClass?: AdminClass | null }) {
  const router = useRouter();
  const [period, setPeriod] = useState<"morning" | "afternoon" | "evening">(editingClass?.period ?? "morning");
  const [error, setError] = useState("");
  const isEditing = Boolean(editingClass);

  async function submit(formData: FormData) {
    const slot = String(formData.get("slot")).split("|");
    const res = await fetch("/api/admin/classes", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: editingClass?.id,
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
    router.push("/admin/classes");
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-4 rounded-md bg-white p-5 shadow-soft md:grid-cols-2">
      <h2 className="text-xl font-black md:col-span-2">{isEditing ? "修改班級" : "新增班級"}</h2>
      {error ? <p className="rounded-md bg-clay/10 p-3 font-bold text-clay md:col-span-2">{error}</p> : null}
      <Field label="課程類型"><Select name="courseTypeId" defaultValue={editingClass?.course_type_id}>{courseTypes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
      <Field label="班級名稱"><Input name="title" required defaultValue={editingClass?.title ?? ""} /></Field>
      <Field label="星期"><Select name="weekday" defaultValue={editingClass?.weekday}>{WEEKDAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</Select></Field>
      <Field label="時段區間"><Select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>{PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</Select></Field>
      <Field label="時段"><Select name="slot" defaultValue={editingClass ? `${editingClass.start_time}|${editingClass.end_time}` : undefined}>{TIME_SLOTS[period].map((s) => <option key={s.label} value={`${s.start}|${s.end}`}>{s.label}</option>)}</Select></Field>
      <Field label="場地"><Input name="location" required defaultValue={editingClass?.location ?? ""} /></Field>
      <Field label="教練"><Input name="coachName" defaultValue={editingClass?.coach_name ?? ""} /></Field>
      <Field label="費用"><Input name="price" type="number" defaultValue={editingClass?.price ?? 0} /></Field>
      <Field label="最低開班人數"><Input name="minimumStudents" type="number" defaultValue={editingClass?.minimum_students ?? 4} /></Field>
      <Field label="最高人數"><Input name="maximumStudents" type="number" defaultValue={editingClass?.maximum_students ?? 8} /></Field>
      <Field label="招生截止日"><Input name="registrationDeadline" type="date" defaultValue={editingClass?.registration_deadline ?? ""} /></Field>
      <Field label="狀態">
        <Select name="status" defaultValue={editingClass?.status ?? "recruiting"}>
          <option value="draft">草稿</option>
          <option value="recruiting">招生中</option>
          <option value="threshold_reached">已達標</option>
          <option value="confirmed">已開班</option>
          <option value="full">已額滿</option>
          <option value="closed">已關閉</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
        </Select>
      </Field>
      <Field label="課程說明"><Textarea name="description" defaultValue={editingClass?.description ?? ""} /></Field>
      <Field label="管理員備註"><Textarea name="adminNotes" defaultValue={editingClass?.admin_notes ?? ""} /></Field>
      <Checkbox name="isPublic" defaultChecked={editingClass?.is_public ?? true} label="公開到前台" />
      <div className="flex flex-wrap gap-3 md:col-span-2">
        <Button>{isEditing ? "儲存修改" : "新增班級"}</Button>
        {isEditing ? <Button type="button" variant="secondary" onClick={() => router.push("/admin/classes")}>取消修改</Button> : null}
      </div>
    </form>
  );
}
