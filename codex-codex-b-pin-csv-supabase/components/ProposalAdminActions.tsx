"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PERIODS, TIME_SLOTS, WEEKDAYS } from "@/lib/constants";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";

export function ProposalAdminActions({ proposal, classes }: { proposal: any; classes: any[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [period, setPeriod] = useState(proposal.requested_period);

  async function send(action: string, formData: FormData) {
    setError("");
    const slot = String(formData.get("slot") ?? "").split("|");
    const res = await fetch("/api/admin/proposals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: proposal.id,
        action,
        classId: formData.get("classId"),
        title: formData.get("title"),
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
        description: formData.get("description"),
        adminNotes: formData.get("adminNotes")
      })
    });
    const json = await res.json();
    if (!json.ok) return setError(json.message);
    router.refresh();
  }

  return (
    <div className="mt-5 border-t border-ink/10 pt-5">
      {error ? <p className="rounded-md bg-clay/10 p-3 font-bold text-clay">{error}</p> : null}
      <form action={(fd) => send("approve", fd)} className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="班級名稱"><Input name="title" defaultValue={`${proposal.course_types?.name} ${proposal.requested_start_time.slice(0, 5)}`} required /></Field>
        <Field label="星期"><Select name="weekday" defaultValue={proposal.requested_weekday}>{WEEKDAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</Select></Field>
        <Field label="時段區間"><Select value={period} onChange={(e) => setPeriod(e.target.value)}>{PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</Select></Field>
        <Field label="時段"><Select name="slot" defaultValue={`${proposal.requested_start_time}|${proposal.requested_end_time}`}>{TIME_SLOTS[period as keyof typeof TIME_SLOTS].map((s) => <option key={s.label} value={`${s.start}|${s.end}`}>{s.label}</option>)}</Select></Field>
        <Field label="場地"><Input name="location" required /></Field>
        <Field label="教練"><Input name="coachName" /></Field>
        <Field label="費用"><Input name="price" type="number" defaultValue="0" /></Field>
        <Field label="最低開班人數"><Input name="minimumStudents" type="number" defaultValue="4" required /></Field>
        <Field label="最高人數"><Input name="maximumStudents" type="number" defaultValue="8" required /></Field>
        <Field label="招生截止日"><Input name="registrationDeadline" type="date" /></Field>
        <Field label="課程說明"><Textarea name="description" /></Field>
        <Field label="管理員備註"><Textarea name="adminNotes" /></Field>
        <div className="flex gap-3 md:col-span-2"><Button>核准並公開</Button></div>
      </form>
      <form action={(fd) => send("merge", fd)} className="mt-4 flex flex-col gap-3 md:flex-row">
        <Select name="classId">{classes.map((c) => <option key={c.id} value={c.id}>{c.course_name}｜{c.title}</option>)}</Select>
        <Button variant="secondary">合併到既有班級</Button>
      </form>
      <form action={(fd) => send("reject", fd)} className="mt-4 flex flex-col gap-3 md:flex-row">
        <Input name="adminNotes" placeholder="拒絕原因或管理員備註" />
        <Button variant="secondary">拒絕</Button>
      </form>
    </div>
  );
}
