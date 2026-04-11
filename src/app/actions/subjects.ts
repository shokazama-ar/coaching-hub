"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResult } from "./team";

async function getTeamId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();
  return data?.team_id ?? null;
}

export async function createSubjectAction(formData: FormData): Promise<ActionResult> {
  const teamId = await getTeamId();
  if (!teamId) return { error: "ログインが必要です" };

  const title = (formData.get("title") as string)?.trim();
  const categoryId = formData.get("category_id") as string;
  const phaseId = (formData.get("phase_id") as string) || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const difficultyStr = formData.get("difficulty") as string;
  const difficulty = difficultyStr ? parseInt(difficultyStr) : null;

  if (!title) return { error: "タイトルを入力してください" };
  if (!categoryId) return { error: "カテゴリを選択してください" };

  const supabase = await createClient();
  const { error } = await supabase.from("subjects").insert({
    team_id: teamId,
    title,
    category_id: categoryId,
    phase_id: phaseId,
    description,
    difficulty,
  });

  if (error) return { error: error.message };
  revalidatePath("/settings/subjects");
  return { success: true };
}

export async function updateSubjectAction(formData: FormData): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const categoryId = formData.get("category_id") as string;
  const phaseId = (formData.get("phase_id") as string) || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const difficultyStr = formData.get("difficulty") as string;
  const difficulty = difficultyStr ? parseInt(difficultyStr) : null;

  if (!title) return { error: "タイトルを入力してください" };

  const supabase = await createClient();
  const { error } = await supabase.from("subjects").update({
    title, category_id: categoryId, phase_id: phaseId, description, difficulty,
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/settings/subjects");
  return { success: true };
}

export async function toggleSubjectActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("subjects").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/settings/subjects");
  return { success: true };
}
