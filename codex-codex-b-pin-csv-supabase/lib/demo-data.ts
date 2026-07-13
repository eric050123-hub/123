import type { PublicClass, PublicRegistrationName } from "@/lib/types";

export const demoClasses: PublicClass[] = [
  {
    id: "demo-1",
    course_type_id: "demo",
    course_name: "成人初階班",
    title: "成人初階週日晚上班",
    description: "適合第一次接觸匹克球的學員。達到最低人數後，寶亮生活學苑會確認場地與教練並通知開班。",
    weekday: 7,
    start_time: "19:00",
    end_time: "21:00",
    period: "evening",
    location: "寶亮生活學苑 A 場",
    coach_name: null,
    price: 1200,
    minimum_students: 8,
    maximum_students: 8,
    registration_deadline: null,
    status: "threshold_reached",
    active_count: 6,
    seats_left: 2,
    created_at: new Date().toISOString()
  },
  {
    id: "demo-2",
    course_type_id: "demo",
    course_name: "成人進階班",
    title: "成人進階週三晚上班",
    description: "加強步伐、控球與雙打配合。滿最低人數後由管理員確認是否正式開班。",
    weekday: 3,
    start_time: "21:00",
    end_time: "00:00",
    period: "evening",
    location: "寶亮生活學苑 B 場",
    coach_name: null,
    price: 1600,
    minimum_students: 8,
    maximum_students: 16,
    registration_deadline: null,
    status: "threshold_reached",
    active_count: 10,
    seats_left: 6,
    created_at: new Date().toISOString()
  }
];

export const demoMaskedRegistrations: PublicRegistrationName[] = [
  { id: "1", masked_name: "陳○○", party_size: 1, status: "active", created_at: "" },
  { id: "2", masked_name: "林○○", party_size: 1, status: "active", created_at: "" },
  { id: "3", masked_name: "王○○", party_size: 2, status: "active", created_at: "" },
  { id: "4", masked_name: "黃○○", party_size: 1, status: "active", created_at: "" },
  { id: "5", masked_name: "張○○", party_size: 1, status: "active", created_at: "" }
];
