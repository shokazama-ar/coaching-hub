"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResult } from "./team";
import type { ReactionType } from "@/types/database";

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

export async function toggleReactionAction(
  logId: string,
  type: ReactionType
): Promise<ActionResult> {
  const ctx = await getUserAndTeam();
  if (!ctx) return { error: "ログインが必要です" };
  const { user, teamId, supabase } = ctx;

  // Check if already reacted
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("practice_log_id", logId)
    .eq("user_id", user.id)
    .eq("type", type)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("reactions").delete().eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("reactions").insert({
      team_id: teamId,
      practice_log_id: logId,
      user_id: user.id,
      type,
    });
    if (error) return { error: error.message };
  }

  revalidatePath(`/practice-logs/${logId}`);
  return { success: true };
}

export async function saveIndividualNoteAction(
  logId: string,
  formData: FormData
): Promise<ActionResult> {
  const ctx = await getUserAndTeam();
  if (!ctx) return { error: "ログインが必要です" };
  const { user, teamId, supabase } = ctx;

  const athleteId = formData.get("athlete_id") as string;
  const content = (formData.get("content") as string)?.trim();
  const positivePoints = (formData.get("positive_points") as string)?.trim() || null;
  const focusPoints = (formData.get("focus_points") as string)?.trim() || null;

  if (!athleteId) return { error: "選手を選択してください" };
  if (!content) return { error: "メモ内容を入力してください" };

  // Upsert by practice_log_id + athlete_id
  const { data: existing } = await supabase
    .from("individual_notes")
    .select("id")
    .eq("practice_log_id", logId)
    .eq("athlete_id", athleteId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("individual_notes").update({
      content, positive_points: positivePoints, focus_points: focusPoints, author_id: user.id,
    }).eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("individual_notes").insert({
      team_id: teamId,
      practice_log_id: logId,
      athlete_id: athleteId,
      author_id: user.id,
      content,
      positive_points: positivePoints,
      focus_points: focusPoints,
    });
    if (error) return { error: error.message };
  }

  revalidatePath(`/practice-logs/${logId}`);
  return { success: true };
}

export async function uploadMediaAction(
  logId: string,
  formData: FormData
): Promise<ActionResult> {
  const ctx = await getUserAndTeam();
  if (!ctx) return { error: "ログインが必要です" };
  const { user, teamId, supabase } = ctx;

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "ファイルを選択してください" };

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${teamId}/${logId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("practice-media")
    .upload(path, file, { contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { error: dbError } = await supabase.from("log_media").insert({
    team_id: teamId,
    practice_log_id: logId,
    uploaded_by: user.id,
    storage_path: path,
    mime_type: file.type,
  });

  if (dbError) return { error: dbError.message };

  revalidatePath(`/practice-logs/${logId}`);
  return { success: true };
}

export async function deleteMediaAction(mediaId: string, storagePath: string, logId: string): Promise<ActionResult> {
  const supabase = await createClient();

  await supabase.storage.from("practice-media").remove([storagePath]);
  const { error } = await supabase.from("log_media").delete().eq("id", mediaId);
  if (error) return { error: error.message };

  revalidatePath(`/practice-logs/${logId}`);
  return { success: true };
}
