import { z } from "zod";
import { TIME_SLOTS } from "@/lib/constants";

const taiwanPhone = z
  .string()
  .regex(/^09\d{8}$/, "請輸入 09 開頭共 10 碼的台灣手機號碼");
const pin = z.string().regex(/^\d{4,8}$/, "PIN 必須是 4 到 8 位數字");

export const registrationSchema = z.object({
  classId: z.string().uuid(),
  fullName: z.string().min(2, "請輸入真實姓名"),
  lineName: z.string().optional().or(z.literal("")),
  partySize: z.coerce.number().int().min(1, "報名人數至少 1 人").max(8, "單次最多報名 8 人").default(1),
  phone: taiwanPhone,
  email: z.string().email("Email 格式不正確").optional().or(z.literal("")),
  ageGroup: z.string().min(1, "請輸入年齡"),
  experienceLevel: z.string().min(1, "請選擇性別"),
  needsPaddle: z.boolean().default(false),
  notes: z.string().max(500).optional().or(z.literal("")),
  pin: pin.optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "請同意個資使用聲明" }) })
});

export const proposalSchema = z.object({
  courseTypeId: z.string().uuid(),
  weekday: z.coerce.number().min(1).max(7),
  period: z.enum(["morning", "afternoon", "evening"]),
  startTime: z.string(),
  endTime: z.string(),
  alternativeSlots: z.array(z.string()).default([]),
  applicantName: z.string().min(2, "請輸入真實姓名"),
  lineName: z.string().min(1, "請輸入 LINE 顯示名稱"),
  phone: taiwanPhone,
  email: z.string().email("Email 格式不正確").optional().or(z.literal("")),
  experienceLevel: z.string().min(1, "請選擇匹克球經驗"),
  notes: z.string().max(500).optional().or(z.literal("")),
  pin,
  consent: z.literal(true, { errorMap: () => ({ message: "請同意個資使用聲明" }) }),
  forceSubmit: z.boolean().default(false)
}).superRefine((data, ctx) => {
  const allowed = TIME_SLOTS[data.period].some(
    (slot) => slot.start === data.startTime && slot.end === data.endTime
  );
  if (!allowed) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "請選擇系統提供的固定兩小時時段" });
  }
});

export const lookupSchema = z.object({ phone: taiwanPhone });

export const updateOwnRegistrationSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["registration", "proposal"]),
  phone: taiwanPhone,
  pin: pin.optional().or(z.literal("")),
  lineName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal(""))
});

export const adminClassSchema = z.object({
  courseTypeId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().optional().or(z.literal("")),
  weekday: z.coerce.number().min(1).max(7),
  period: z.enum(["morning", "afternoon", "evening"]),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().min(1),
  coachName: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0).optional(),
  minimumStudents: z.coerce.number().min(1),
  maximumStudents: z.coerce.number().min(1),
  registrationDeadline: z.string().optional().or(z.literal("")),
  status: z.string(),
  isPublic: z.boolean().default(true),
  adminNotes: z.string().optional().or(z.literal(""))
});
