import { AdminNav } from "@/components/AdminNav";
import { Field, Input, Textarea, Checkbox, Button } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export default async function SettingsPage() {
  await requireAdmin();
  const supabase = supabaseAdmin();
  const { data } = await supabase.from("system_settings").select("key,value");
  const settings = Object.fromEntries((data ?? []).map((item) => [item.key, item.value]));

  async function saveSettings(formData: FormData) {
    "use server";
    await requireAdmin();
    const admin = supabaseAdmin();
    const rows = [
      { key: "brand_name", value: String(formData.get("brandName") ?? "") },
      { key: "contact_phone", value: String(formData.get("contactPhone") ?? "") },
      { key: "line_official", value: String(formData.get("lineOfficial") ?? "") },
      { key: "address", value: String(formData.get("address") ?? "") },
      { key: "privacy_statement", value: String(formData.get("privacyStatement") ?? "") },
      { key: "default_minimum_students", value: Number(formData.get("defaultMinimumStudents") ?? 4) },
      { key: "default_maximum_students", value: Number(formData.get("defaultMaximumStudents") ?? 8) },
      { key: "allow_student_cancel", value: formData.get("allowStudentCancel") === "on" },
      { key: "lock_after_confirmed", value: formData.get("lockAfterConfirmed") === "on" }
    ];
    await admin.from("system_settings").upsert(rows);
  }

  const textValue = (key: string, fallback: string) => typeof settings[key] === "string" ? settings[key] : fallback;
  const numberValue = (key: string, fallback: number) => typeof settings[key] === "number" ? settings[key] : fallback;
  const boolValue = (key: string, fallback: boolean) => typeof settings[key] === "boolean" ? settings[key] : fallback;

  return (
    <div className="min-h-screen bg-mist">
      <AdminNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-black">系統設定</h1>
        <form action={saveSettings} className="mt-6 grid gap-5 rounded-md bg-white p-6 shadow-soft md:grid-cols-2">
          <Field label="品牌名稱"><Input name="brandName" defaultValue={textValue("brand_name", "寶亮生活學苑")} /></Field>
          <Field label="聯絡電話"><Input name="contactPhone" defaultValue={textValue("contact_phone", "")} placeholder="請輸入聯絡電話" /></Field>
          <Field label="LINE 官方帳號文字"><Input name="lineOfficial" defaultValue={textValue("line_official", "")} placeholder="@baoliang" /></Field>
          <Field label="地址"><Input name="address" defaultValue={textValue("address", "")} placeholder="請輸入地址" /></Field>
          <Field label="預設最低開班人數"><Input name="defaultMinimumStudents" type="number" defaultValue={numberValue("default_minimum_students", 4)} /></Field>
          <Field label="預設最高人數"><Input name="defaultMaximumStudents" type="number" defaultValue={numberValue("default_maximum_students", 8)} /></Field>
          <Checkbox name="allowStudentCancel" label="允許學員取消" defaultChecked={boolValue("allow_student_cancel", true)} />
          <Checkbox name="lockAfterConfirmed" label="開班後鎖定修改" defaultChecked={boolValue("lock_after_confirmed", true)} />
          <div className="md:col-span-2"><Field label="個資聲明"><Textarea name="privacyStatement" defaultValue={textValue("privacy_statement", "個人資料僅供寶亮生活學苑聯絡與開班使用，不會公開顯示。")} /></Field></div>
          <div className="md:col-span-2"><Button>儲存設定</Button></div>
        </form>
      </main>
    </div>
  );
}
