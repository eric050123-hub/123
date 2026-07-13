"use client";

import { useState } from "react";
import { allSlotOptions, EXPERIENCE_OPTIONS, PERIODS, TIME_SLOTS, WEEKDAYS } from "@/lib/constants";
import type { CourseType } from "@/lib/types";
import { Button, Checkbox, ErrorState, Field, Input, LinkButton, Select, Textarea } from "@/components/ui";

export function ProposalForm({ courseTypes }: { courseTypes: CourseType[] }) {
  const [period, setPeriod] = useState<"morning" | "afternoon" | "evening">("morning");
  const [duplicate, setDuplicate] = useState<{ id: string; title: string } | null>(null);
  const [force, setForce] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    setMessage("");
    const slot = String(formData.get("slot")).split("|");
    const alternatives = formData.getAll("alternativeSlots").map(String);
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        courseTypeId: formData.get("courseTypeId"),
        weekday: formData.get("weekday"),
        period,
        startTime: slot[0],
        endTime: slot[1],
        alternativeSlots: alternatives,
        applicantName: formData.get("applicantName"),
        lineName: formData.get("lineName"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        experienceLevel: formData.get("experienceLevel"),
        notes: formData.get("notes"),
        pin: formData.get("pin"),
        consent: formData.get("consent") === "on",
        forceSubmit: force
      })
    });
    const json = await res.json();
    setPending(false);
    if (!json.ok && json.duplicate) {
      setDuplicate(json.duplicate);
      setError(json.message);
      return;
    }
    if (!json.ok) return setError(json.message);
    setMessage("已收到您的開班提案。寶亮生活學苑將確認場地與教練時間，核准後才會公開招生。");
    setDuplicate(null);
  }

  return (
    <form action={submit} className="grid gap-5">
      {message ? <div className="rounded-md bg-leaf/10 p-4 font-semibold text-leaf">{message}</div> : null}
      {error ? <ErrorState message={error} /> : null}
      {duplicate ? (
        <div className="rounded-md border border-court bg-court/15 p-4">
          <p className="font-bold">已有相同時段正在招生：{duplicate.title}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <LinkButton href={`/classes/${duplicate.id}`} variant="secondary">前往現有班級</LinkButton>
            <Button type="button" onClick={() => setForce(true)}>仍要送出提案</Button>
          </div>
        </div>
      ) : null}
      <Field label="課程類型"><Select name="courseTypeId" required>{courseTypes.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</Select></Field>
      <Field label="星期"><Select name="weekday" required>{WEEKDAYS.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</Select></Field>
      <Field label="時段區間">
        <Select value={period} onChange={(event) => setPeriod(event.target.value as typeof period)}>{PERIODS.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</Select>
      </Field>
      <Field label="固定兩小時時段">
        <Select name="slot" required>{TIME_SLOTS[period].map((slot) => <option value={`${slot.start}|${slot.end}`} key={slot.label}>{slot.label}</option>)}</Select>
      </Field>
      <fieldset className="grid gap-2">
        <legend className="font-semibold">可接受的其他時段（選填）</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {allSlotOptions().map((slot) => <Checkbox key={slot.label} name="alternativeSlots" value={`${slot.period}:${slot.start}-${slot.end}`} label={slot.label} />)}
        </div>
      </fieldset>
      <Field label="真實姓名"><Input name="applicantName" required /></Field>
      <Field label="LINE 顯示名稱"><Input name="lineName" required /></Field>
      <Field label="手機號碼"><Input name="phone" inputMode="numeric" required /></Field>
      <Field label="Email（選填）"><Input name="email" type="email" /></Field>
      <Field label="匹克球經驗"><Select name="experienceLevel" required><option value="">請選擇</option>{EXPERIENCE_OPTIONS.map((item) => <option key={item}>{item}</option>)}</Select></Field>
      <Field label="備註（選填）"><Textarea name="notes" /></Field>
      <Field label="自訂 PIN"><Input name="pin" inputMode="numeric" required /></Field>
      <Checkbox name="consent" required label="我同意個人資料僅供寶亮生活學苑聯絡與開班使用" />
      <Button disabled={pending}>{pending ? "送出中..." : force ? "仍要送出提案" : "送出提案"}</Button>
    </form>
  );
}
