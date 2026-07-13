import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(error: unknown, status = 400) {
  if (error instanceof ZodError) {
    return NextResponse.json({ ok: false, message: error.errors[0]?.message ?? "資料格式不正確" }, { status });
  }
  if (error instanceof Error) {
    return NextResponse.json({ ok: false, message: error.message }, { status });
  }
  return NextResponse.json({ ok: false, message: "發生未知錯誤" }, { status });
}

export function cleanOptional(value?: string | null) {
  return value && value.trim().length > 0 ? value.trim() : null;
}

export function csvResponse(filename: string, rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0] ?? { message: "沒有資料" });
  const escape = (value: unknown) => {
    const text = value == null ? "" : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };
  const body = [headers.join(","), ...rows.map((row) => headers.map((key) => escape(row[key])).join(","))].join("\n");
  return new Response(`\uFEFF${body}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`
    }
  });
}
