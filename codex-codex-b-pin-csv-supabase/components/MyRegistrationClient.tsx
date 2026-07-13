"use client";

import { useState } from "react";
import { weekdayLabel } from "@/lib/constants";
import { Button, ErrorState, Field, Input, Textarea } from "@/components/ui";

type LookupResult = {
  registrations: Array<any>;
  proposals: Array<any>;
};

export function MyRegistrationClient() {
  const [phone, setPhone] = useState("");
  const [data, setData] = useState<LookupResult | null>(null);
  const [error, setError] = useState("");

  async function lookup() {
    setError("");
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
    const res = await fetch("/api/my-registration", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, id, phone })
    });
    const json = await res.json();
    if (!json.ok) return setError(json.message);
    await lookup();
  }

  return (
    <div className="grid gap-6">
      {error ? <ErrorState message={error} /> : null}
      <div className="grid gap-4 rounded-md bg-white p-5 shadow-soft">
        <Field label="手機號碼"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        <Button type="button" onClick={lookup}>查詢我的登記</Button>
      </div>
      {data ? (
        <div className="grid gap-5">
          {data.registrations.map((item) => (
            <section key={item.id} className="rounded-md bg-white p-5 shadow-soft">
              <h2 className="text-xl font-black">{item.classes?.title}</h2>
              <p className="mt-2 text-ink/70">{weekdayLabel(item.classes?.weekday)} {item.classes?.start_time}-{item.classes?.end_time}</p>
              <p className="mt-2 font-semibold">狀態：{item.status}</p>
              <Field label="備註"><Textarea defaultValue={item.notes ?? ""} readOnly /></Field>
              <Button variant="secondary" type="button" onClick={() => cancel("registration", item.id)}>取消登記</Button>
            </section>
          ))}
          {data.proposals.map((item) => (
            <section key={item.id} className="rounded-md bg-white p-5 shadow-soft">
              <h2 className="text-xl font-black">{item.course_types?.name} 開班提案</h2>
              <p className="mt-2 text-ink/70">{weekdayLabel(item.requested_weekday)} {item.requested_start_time}-{item.requested_end_time}</p>
              <p className="mt-2 font-semibold">狀態：{item.status}</p>
              <Button variant="secondary" type="button" onClick={() => cancel("proposal", item.id)}>取消待審核提案</Button>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
