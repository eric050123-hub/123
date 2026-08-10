import { weekdayLabel } from "@/lib/constants";
import type { PublicClass } from "@/lib/types";
import { LinkButton, ProgressBar, StatusBadge } from "@/components/ui";

export function ClassCard({ item }: { item: PublicClass }) {
  const openingTarget = Math.max(item.minimum_students, 1);
  const openingProgress = (item.active_count / openingTarget) * 100;
  const remaining = Math.max(item.maximum_students - item.active_count, 0);
  return (
    <article className="rounded-[24px] bg-white p-5 shadow-soft sm:rounded-[28px] sm:p-6">
      <div className="grid gap-3 sm:flex sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-black leading-tight tracking-normal sm:text-3xl">{item.title}</h2>
          <p className="mt-2 text-base font-semibold leading-relaxed text-ink/55 sm:mt-3 sm:text-xl">
            {weekdayLabel(item.weekday)} {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
          </p>
        </div>
        <div className="justify-self-start sm:justify-self-auto">
          <StatusBadge status={item.status} />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-[2.6rem_1fr] gap-x-3 gap-y-2 text-base sm:grid-cols-[2.4rem_1fr] sm:text-lg">
        <span className="font-bold text-ink/35">地點</span>
        <span className="break-words font-bold leading-relaxed">{item.location ?? "地點確認中"}</span>
        <span className="font-bold text-ink/35">費用</span>
        <span className="font-bold text-ink/70">{item.price ? `$${item.price}` : "確認中"}</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
        <Stat label="登記" value={`${item.active_count}/${item.maximum_students}`} />
        <Stat label="開班" value={`${Math.min(item.active_count, openingTarget)}/${openingTarget}`} />
        <Stat label="剩餘" value={String(remaining)} />
      </div>
      <div className="mt-5">
        <ProgressBar value={openingProgress} />
      </div>
      <div className="mt-4 grid gap-3 text-base sm:flex sm:items-center sm:justify-between sm:text-lg">
        <span className="font-semibold leading-relaxed text-ink/55">
          {item.active_count >= openingTarget ? "已達開班人數" : `${openingTarget} 人就可以開班，尚差 ${openingTarget - item.active_count} 人`}
        </span>
        <LinkButton href={`/classes/${item.id}`} variant="ghost" className="min-h-0 justify-start px-0 py-0 text-base sm:justify-center sm:text-lg">
          查看場次 →
        </LinkButton>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-ink/10 bg-white px-3 py-3 sm:px-4 sm:py-4">
      <p className="text-sm font-black text-ink/30 sm:text-base">{label}</p>
      <p className="mt-1 break-words text-2xl font-black sm:mt-2 sm:text-3xl">{value}</p>
    </div>
  );
}
