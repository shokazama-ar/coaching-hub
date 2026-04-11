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

export async function createPhaseAction(formData: FormData): Promise<ActionResult> {
  const teamId = await getTeamId();
  if (!teamId) return { error: "ログインが必要です" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  if (!name) return { error: "フェーズ名を入力してください" };

  const supabase = await createClient();

  // Get current max sort_order
  const { data: phases } = await supabase
    .from("phases")
    .select("sort_order")
    .eq("team_id", teamId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (phases?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("phases").insert({
    team_id: teamId, name, description, sort_order: nextOrder,
  });

  if (error) return { error: error.message };
  revalidatePath("/settings/phases");
  return { success: true };
}

export async function updatePhaseAction(formData: FormData): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  if (!name) return { error: "フェーズ名を入力してください" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("phases")
    .update({ name, description })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/settings/phases");
  return { success: true };
}

export async function deletePhaseAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("phases").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/settings/phases");
  return { success: true };
}

export async function movePhaseAction(id: string, direction: "up" | "down"): Promise<ActionResult> {
  const teamId = await getTeamId();
  if (!teamId) return { error: "ログインが必要です" };

  const supabase = await createClient();
  const { data: phases } = await supabase
    .from("phases")
    .select("id, sort_order")
    .eq("team_id", teamId)
    .order("sort_order");

  if (!phases) return { error: "データ取得エラー" };

  const idx = phases.findIndex((p) => p.id === id);
  if (idx < 0) return { error: "見つかりません" };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= phases.length) return { success: true };

  const current = phases[idx];
  const swap = phases[swapIdx];

  await Promise.all([
    supabase.from("phases").update({ sort_order: swap.sort_order }).eq("id", current.id),
    supabase.from("phases").update({ sort_order: current.sort_order }).eq("id", swap.id),
  ]);

  revalidatePath("/settings/phases");
  return { success: true };
}
