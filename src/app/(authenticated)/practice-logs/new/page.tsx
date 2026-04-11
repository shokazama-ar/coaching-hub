import { createClient } from "@/lib/supabase/server";
import LogForm from "@/components/practice/log-form";

export default async function NewPracticeLogPage() {
  const supabase = await createClient();

  const [categoriesRes, subjectsRes, phasesRes] = await Promise.all([
    supabase.from("categories").select("id, kind, name, is_primary").order("sort_order"),
    supabase.from("subjects").select("id, title, category_id").eq("is_active", true).order("title"),
    supabase.from("phases").select("id, name").order("sort_order"),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-base font-semibold text-gray-900">練習ログを作成</h1>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <LogForm
          categories={categoriesRes.data ?? []}
          subjects={subjectsRes.data ?? []}
          phases={phasesRes.data ?? []}
        />
      </div>
    </div>
  );
}
