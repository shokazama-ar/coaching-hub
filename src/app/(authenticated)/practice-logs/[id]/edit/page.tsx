import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogForm from "@/components/practice/log-form";

export default async function EditPracticeLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [logRes, categoriesRes, subjectsRes, phasesRes] = await Promise.all([
    supabase
      .from("practice_logs")
      .select(`
        id, practice_date, title, phase_id, daily_reflection,
        practice_log_subjects (
          id, subject_id, block_order, duration_minutes, memo,
          subjects (id, title, category_id)
        )
      `)
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id, kind, name, is_primary").order("sort_order"),
    supabase.from("subjects").select("id, title, category_id").eq("is_active", true).order("title"),
    supabase.from("phases").select("id, name").order("sort_order"),
  ]);

  if (!logRes.data) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-base font-semibold text-gray-900">練習ログを編集</h1>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <LogForm
          categories={categoriesRes.data ?? []}
          subjects={subjectsRes.data ?? []}
          phases={phasesRes.data ?? []}
          existing={logRes.data as unknown as Parameters<typeof LogForm>[0]["existing"]}
        />
      </div>
    </div>
  );
}
