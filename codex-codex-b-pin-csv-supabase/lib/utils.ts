export function clsx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatDate(date?: string | null) {
  if (!date) return "未設定";
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(date));
}

export function statusText(status: string, count: number, minimum: number) {
  if (status === "confirmed") return "已確認開班";
  if (status === "full") return "目前額滿";
  if (count === 0) return "等待第一位學員";
  if (count >= minimum) return "已達開班標準，等待主辦確認";
  return `還差 ${minimum - count} 人即可開班`;
}
