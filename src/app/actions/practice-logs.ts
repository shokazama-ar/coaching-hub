"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ActionResult } from "./team";

async function getUserAndTeam() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();
  if (!profile) return null;
  return { user, teamId: profile.team_id, supabase };
}

export type LogSubjectInput = {
  subject_id: string;
  block_order: number;
  duration_minutes: number | null;
  memo: string | null;
};

export async function createPracticeLogAction(
  formData: FormData,
  subjects: LogSubjectInput[]
): Promise<ActionResult | void> {
  const ctx = await getUserAndTeam();
  if (!ctx) return { error: "ログインが必要です" };

  const { user, teamId, supabase } = ctx;
  const practiceDate = formData.get("practice_date") as string;
  const title = (formData.get("title") as string)?.trim() || null;
  const phaseId = (formData.get("phase_id") as string) || null;
  const dailyReflection = (formData.get("daily_reflection") as string)?.trim() || null;

  if (!practiceDate) return { error: "日付を入力してください" };

  const { data: log, error: logError } = await supabase
    .from("practice_logs")
    .insert({
      team_id: teamId,
      practice_date: practiceDate,
      title,
      phase_id: phaseId,
      daily_reflection: dailyReflection,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (logError || !log) return { error: logError?.message ?? "作成に失敗しました" };

  if (subjects.length > 0) {
    const { error: subjError } = await supabase.from("practice_log_subjects").insert(
      subjects.map((s) => ({ practice_log_id: log.id, ...s }))
    );
    if (subjError) return { error: subjError.message };
  }

  revalidatePath("/practice-logs");
  redirect(`/practice-logs/${log.id}`);
}

export async function updatePracticeLogAction(
  logId: string,
  formData: FormData,
  subjects: LogSubjectInput[]
): Promise<ActionResult | void> {
  const ctx = await getUserAndTeam();
  if (!ctx) return { error: "ログインが必要です" };

  const { supabase } = ctx;
  const practiceDate = formData.get("practice_date") as string;
  const title = (formData.get("title") as string)?.trim() || null;
  const phaseId = (formData.get("phase_id") as string) || null;
  const dailyReflection = (formData.get("daily_reflection") as string)?.trim() || null;

  if (!practiceDate) return { error: "日付を入力してください" };

  const { error: logError } = await supabase.from("practice_logs").update({
    practice_date: practiceDate,
    title,
    phase_id: phaseId,
    daily_reflection: dailyReflection,
  }).eq("id", logId);

  if (logError) return { error: logError.message };

  // Replace subjects: delete all then re-insert
  await supabase.from("practice_log_subjects").delete().eq("practice_log_id", logId);

  if (subjects.length > 0) {
    const { error: subjError } = await supabase.from("practice_log_subjects").insert(
      subjects.map((s) => ({ practice_log_id: logId, ...s }))
    );
    if (subjError) return { error: subjError.message };
  }

  revalidatePath("/practice-logs");
  revalidatePath(`/practice-logs/${logId}`);
  redirect(`/practice-logs/${logId}`);
}

export async function deletePracticeLogAction(logId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("practice_logs").delete().eq("id", logId);
  if (error) return { error: error.message };
  revalidatePath("/practice-logs");
  return { success: true };
}
