import Link from "next/link";
import { clsx } from "@/lib/utils";

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-base font-semibold transition focus-ring disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-leaf text-white hover:bg-ink",
        variant === "secondary" && "border border-leaf/25 bg-white text-leaf hover:bg-mist",
        variant === "ghost" && "text-leaf hover:bg-mist",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  className,
  variant = "primary"
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-base font-semibold transition focus-ring",
        variant === "primary" && "bg-leaf text-white hover:bg-ink",
        variant === "secondary" && "border border-leaf/25 bg-white text-leaf hover:bg-mist",
        variant === "ghost" && "text-leaf hover:bg-mist",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx("focus-ring min-h-12 w-full rounded-md border border-ink/15 bg-white px-4 py-3", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx("focus-ring min-h-28 w-full rounded-md border border-ink/15 bg-white px-4 py-3", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={clsx("focus-ring min-h-12 w-full rounded-md border border-ink/15 bg-white px-4 py-3", className)} {...props} />;
}

export function Checkbox({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 text-base">
      <input type="checkbox" className="mt-1 h-5 w-5 rounded border-ink/30 accent-leaf" {...props} />
      <span>{label}</span>
    </label>
  );
}

export function Field({
  label,
  hint,
  children
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-semibold">{label}</span>
      {children}
      {hint ? <span className="text-sm text-ink/60">{hint}</span> : null}
    </label>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    recruiting: "招生中",
    threshold_reached: "已達標",
    confirmed: "已開班",
    full: "已額滿",
    closed: "已關閉",
    draft: "草稿",
    completed: "已完成",
    cancelled: "已取消",
    pending: "待審核",
    approved: "已核准",
    merged: "已合併",
    rejected: "已拒絕",
    active: "有效",
    locked: "已鎖定"
  };
  return (
    <span className="inline-flex rounded-full bg-court/20 px-3 py-1 text-sm font-semibold text-ink">
      {map[status] ?? status}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-ink/10">
      <div className="h-full rounded-full bg-leaf" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-dashed border-ink/20 bg-white p-8 text-center">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 text-ink/65">{text}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-md border border-clay/40 bg-clay/10 p-4 font-semibold text-clay">{message}</div>;
}
