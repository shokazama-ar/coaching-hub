"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResult } from "./team";

export async function updateTeamAction(formData: FormData): Promise<ActionResult> {
  const teamId = formData.get("team_id") as string;
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();

  if (!name) return { error: "チーム名を入力してください" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("teams")
    .update({ name, description: description || null })
    .eq("id", teamId);

  if (error) return { error: error.message };
  return { success: true };
}
