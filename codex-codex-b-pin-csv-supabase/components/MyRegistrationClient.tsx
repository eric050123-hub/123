"use client";

import { useState } from "react";
import { weekdayLabel } from "@/lib/constants";
import { Button, ErrorState, Field, Input, LinkButton } from "@/components/ui";

type LookupResult = {
  registrations: Array<any>;
  proposals: Array<any>;
};

export function MyRegistrationClient() {
  const [phone, setPhone] = useState("");
  const [data, setData] = useState<LookupResult | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function lookup() {
    setError("");
    setMessage("");
    const res = await fetch("/api/my-registration", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone })
    });
    const json = await res.json();
    if (!json.ok) return setError(json.message);
    setData({ registrations: json.registrations, proposals: json.proposals });
  }

  async function cancel(type: "registration" | "proposal", id: string) {
    setError("");
    setMessage("");
    const res = await fetch("/api/my-registration", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, id, phone })
    });
    const json = await res.json();
    if (!json.ok) return setError(json.message);
    await lookup();
    setMessage(type === "registration" ? "已為您取消預約。" : "已為您取消開班提案。");
  }

  return (
    <div className="grid gap-6">
      {error ? <ErrorState message={error} /> : null}
      {message ? <div className="rounded-md bg-leaf/10 p-4 font-semibold text-leaf">{message}</div> : null}
      <div className="grid gap-4 rounded-md bg-white p-5 shadow-soft">
        <Field label="手機號碼"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        <Button type="button" onClick={lookup}>查詢我的登記</Button>
        <p className="text-sm font-semibold leading-relaxed text-ink/55">
          有問題請聯絡官方帳號：
          <a href="https://line.me/R/ti/p/@933gxjgi" target="_blank" rel="noreferrer" className="text-leaf underline underline-offset-4">
            LINE 官方帳號
          </a>
        </p>
      </div>
      {data ? (
        <div className="grid gap-5">
          {data.registrations.map((item) => (
            <section key={item.id} className="rounded-md bg-white p-5 shadow-soft">
              <h2 className="text-xl font-black">{item.classes?.title}</h2>
              <p className="mt-2 text-ink/70">{weekdayLabel(item.classes?.weekday)} {item.classes?.start_time}-{item.classes?.end_time}</p>
              <p className="mt-2 font-semibold">狀態：{statusText(item.status)}</p>
              {item.status === "cancelled" ? (
                <p className="mt-3 rounded-md bg-leaf/10 p-3 font-semibold text-leaf">已為您取消預約。</p>
              ) : (
                <Button variant="secondary" type="button" onClick={() => cancel("registration", item.id)}>取消登記</Button>
              )}
            </section>
          ))}
          {data.proposals.map((item) => (
            <section key={item.id} className="rounded-md bg-white p-5 shadow-soft">
              <h2 className="text-xl font-black">{item.course_types?.name} 開班提案</h2>
              <p className="mt-2 text-ink/70">{weekdayLabel(item.requested_weekday)} {item.requested_start_time}-{item.requested_end_time}</p>
              <p className="mt-2 font-semibold">狀態：{statusText(item.status)}</p>
              {item.status === "cancelled" ? (
                <p className="mt-3 rounded-md bg-leaf/10 p-3 font-semibold text-leaf">已為您取消開班提案。</p>
              ) : (
                <Button variant="secondary" type="button" onClick={() => cancel("proposal", item.id)}>取消待審核提案</Button>
              )}
            </section>
          ))}
          <div className="rounded-md bg-white p-5 shadow-soft">
            <p className="font-semibold leading-relaxed text-ink/65">有問題請聯絡官方帳號。</p>
            <LinkButton href="https://line.me/R/ti/p/@933gxjgi" variant="secondary" className="mt-3">
              聯絡 LINE 官方帳號
            </LinkButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function statusText(status: string) {
  const map: Record<string, string> = {
    active: "有效",
    confirmed: "已確認",
    locked: "已鎖定",
    cancelled: "已為您取消預約",
    pending: "待審核",
    approved: "已核准",
    merged: "已合併",
    rejected: "已拒絕"
  };
  return map[status] ?? status;
}
