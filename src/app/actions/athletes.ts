"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResult } from "./team";

async function getTeamId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();
  return profile?.team_id ?? null;
}

export async function createAthleteAction(formData: FormData): Promise<ActionResult> {
  const teamId = await getTeamId();
  if (!teamId) return { error: "ログインが必要です" };

  const nickname = (formData.get("nickname") as string)?.trim();
  const gradeBand = (formData.get("grade_band") as string)?.trim() || null;
  const groupLabel = (formData.get("group_label") as string)?.trim() || null;
  const numberStr = formData.get("number") as string;
  const number = numberStr ? parseInt(numberStr) : null;
  const memo = (formData.get("memo") as string)?.trim() || null;

  if (!nickname) return { error: "ニックネームを入力してください" };

  const supabase = await createClient();
  const { error } = await supabase.from("athletes").insert({
    team_id: teamId,
    nickname,
    grade_band: gradeBand,
    group_label: groupLabel,
    number,
    memo,
  });

  if (error) return { error: error.message };
  revalidatePath("/athletes");
  return { success: true };
}

export async function updateAthleteAction(formData: FormData): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const nickname = (formData.get("nickname") as string)?.trim();
  const gradeBand = (formData.get("grade_band") as string)?.trim() || null;
  const groupLabel = (formData.get("group_label") as string)?.trim() || null;
  const numberStr = formData.get("number") as string;
  const number = numberStr ? parseInt(numberStr) : null;
  const memo = (formData.get("memo") as string)?.trim() || null;

  if (!nickname) return { error: "ニックネームを入力してください" };

  const supabase = await createClient();
  const { error } = await supabase.from("athletes").update({
    nickname,
    grade_band: gradeBand,
    group_label: groupLabel,
    number,
    memo,
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/athletes");
  return { success: true };
}

export async function toggleAthleteActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("athletes").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/athletes");
  return { success: true };
}
