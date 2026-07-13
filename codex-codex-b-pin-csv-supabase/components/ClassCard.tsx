import { weekdayLabel } from "@/lib/constants";
import type { PublicClass } from "@/lib/types";
import { LinkButton, ProgressBar, StatusBadge } from "@/components/ui";

export function ClassCard({ item }: { item: PublicClass }) {
  const openingTarget = Math.max(item.minimum_students, 1);
  const openingProgress = (item.active_count / openingTarget) * 100;
  const remaining = Math.max(item.maximum_students - item.active_count, 0);
  return (
    <article className="rounded-[28px] bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black tracking-normal">{item.title}</h2>
          <p className="mt-3 text-xl font-semibold text-ink/55">
            {weekdayLabel(item.weekday)}　{item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="mt-5 grid grid-cols-[2.4rem_1fr] gap-x-3 gap-y-2 text-lg">
        <span className="font-bold text-ink/35">地點</span>
        <span className="font-bold">{item.location ?? "地點確認中"}</span>
        <span className="font-bold text-ink/35">費用</span>
        <span className="font-bold text-ink/70">{item.price ? `$${item.price}` : "確認中"}</span>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="登記" value={`${item.active_count}/${item.maximum_students}`} />
        <Stat label="開班" value={`${Math.min(item.active_count, openingTarget)}/${openingTarget}`} />
        <Stat label="剩餘" value={String(remaining)} />
      </div>
      <div className="mt-5">
        <ProgressBar value={openingProgress} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-lg">
        <span className="text-ink/55">
          {item.active_count >= openingTarget ? "已達開班人數" : `${openingTarget} 人就可以開班，尚差 ${openingTarget - item.active_count} 人`}
        </span>
        <LinkButton href={`/classes/${item.id}`} variant="ghost" className="min-h-0 px-0 py-0 text-lg">
          查看場次 →
        </LinkButton>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white px-4 py-4">
      <p className="text-base font-black text-ink/30">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
