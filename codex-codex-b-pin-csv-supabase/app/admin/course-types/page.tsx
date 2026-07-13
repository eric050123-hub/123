import { AdminNav } from "@/components/AdminNav";
import { CourseTypeManager } from "@/components/CourseTypeManager";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function CourseTypesPage() {
  await requireAdmin();
  const { data } = await supabaseAdmin().from("course_types").select("*").order("sort_order");
  return (
    <div className="min-h-screen bg-mist">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-black">課程類型管理</h1>
        <CourseTypeManager items={data ?? []} />
      </main>
    </div>
  );
}
