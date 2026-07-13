export const WEEKDAYS = [
  { value: 1, label: "星期一" },
  { value: 2, label: "星期二" },
  { value: 3, label: "星期三" },
  { value: 4, label: "星期四" },
  { value: 5, label: "星期五" },
  { value: 6, label: "星期六" },
  { value: 7, label: "星期日" }
];

export const PERIODS = [
  { value: "morning", label: "上午" },
  { value: "afternoon", label: "下午" },
  { value: "evening", label: "晚上" }
] as const;

export const TIME_SLOTS = {
  morning: [
    { start: "08:00", end: "10:00", label: "08:00-10:00" },
    { start: "09:00", end: "11:00", label: "09:00-11:00" },
    { start: "10:00", end: "12:00", label: "10:00-12:00" }
  ],
  afternoon: [
    { start: "14:00", end: "16:00", label: "14:00-16:00" },
    { start: "15:00", end: "17:00", label: "15:00-17:00" },
    { start: "16:00", end: "18:00", label: "16:00-18:00" }
  ],
  evening: [
    { start: "18:00", end: "20:00", label: "18:00-20:00" },
    { start: "19:00", end: "21:00", label: "19:00-21:00" },
    { start: "20:00", end: "22:00", label: "20:00-22:00" }
  ]
} as const;

export const EXPERIENCE_OPTIONS = ["完全沒有", "體驗過", "初學", "有基礎", "進階"];
export const AGE_GROUPS = ["6-12", "13-17", "18-29", "30-39", "40-49", "50-59", "60 以上"];

export function weekdayLabel(value: number) {
  return WEEKDAYS.find((item) => item.value === value)?.label ?? `星期${value}`;
}

export function periodLabel(value: string) {
  return PERIODS.find((item) => item.value === value)?.label ?? value;
}

export function allSlotOptions() {
  return PERIODS.flatMap((period) =>
    TIME_SLOTS[period.value].map((slot) => ({
      period: period.value,
      label: `${period.label} ${slot.label}`,
      start: slot.start,
      end: slot.end
    }))
  );
}
