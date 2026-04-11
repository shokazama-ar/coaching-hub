import { createClient } from "@/lib/supabase/server";
import SubjectsManager from "./subjects-manager";

export default async function SubjectsPage() {
  const supabase = await createClient();

  const [subjectsRes, categoriesRes, phasesRes] = await Promise.all([
    supabase
      .from("subjects")
      .select("id, title, category_id, phase_id, difficulty, is_active, categories(kind, name)")
      .order("title"),
    supabase
      .from("categories")
      .select("id, kind, name, is_primary")
      .order("sort_order"),
    supabase
      .from("phases")
      .select("id, name")
      .order("sort_order"),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-base font-semibold text-gray-900">Subject 管理</h1>
      <SubjectsManager
        subjects={(subjectsRes.data ?? []) as unknown as Parameters<typeof SubjectsManager>[0]["subjects"]}
        categories={categoriesRes.data ?? []}
        phases={phasesRes.data ?? []}
      />
    </div>
  );
}
