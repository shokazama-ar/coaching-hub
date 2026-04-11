"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CATEGORY_KINDS, CATEGORY_KIND_LABELS } from "@/types/database";

export type ActionResult = { error: string } | { success: true };

export async function createTeamAction(formData: FormData): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim();
  const displayName = (formData.get("display_name") as string)?.trim();

  if (!name) return { error: "チーム名を入力してください" };
  if (!displayName) return { error: "表示名を入力してください" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  // UUIDをサーバー側で生成し、.select()を使わずINSERT
  // （オンボーディング時はプロフィール未作成のため current_team_id()=NULL となり
  //   INSERT後の .select() がRLS違反になるため）
  const { randomUUID } = await import("crypto");
  const teamId = randomUUID();
  const roleId = randomUUID();

  // Create team
  const { error: teamError } = await supabase
    .from("teams")
    .insert({ id: teamId, name, created_by: user.id });

  if (teamError) return { error: teamError.message ?? "チーム作成に失敗しました" };

  // Create default admin role
  const { error: roleError } = await supabase
    .from("roles")
    .insert({ id: roleId, team_id: teamId, name: "メインコーチ", is_admin: true });

  if (roleError) return { error: roleError.message ?? "ロール作成に失敗しました" };

  // Create profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: user.id, team_id: teamId, display_name: displayName, role_id: roleId });

  if (profileError) return { error: profileError.message };

  // Create 5 default categories
  const categories = CATEGORY_KINDS.map((kind, i) => ({
    team_id: teamId,
    kind,
    name: CATEGORY_KIND_LABELS[kind],
    is_primary: true,
    sort_order: i,
  }));

  const { error: catError } = await supabase.from("categories").insert(categories);
  if (catError) return { error: catError.message };

  redirect("/");
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const displayName = (formData.get("display_name") as string)?.trim();
  if (!displayName) return { error: "表示名を入力してください" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function inviteCoachAction(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim();
  if (!email) return { error: "メールアドレスを入力してください" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  // Check admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(is_admin)")
    .eq("id", user.id)
    .single();

  const isAdmin = (profile?.roles as unknown as { is_admin: boolean } | null)?.is_admin ?? false;
  if (!isAdmin) return { error: "管理者のみ招待できます" };

  // Use Supabase admin client for invite
  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/onboarding`,
  });

  if (inviteError) return { error: inviteError.message };
  return { success: true };
}

export async function createRoleAction(formData: FormData): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim();
  const isAdmin = formData.get("is_admin") === "true";
  if (!name) return { error: "ロール名を入力してください" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id, role_id, roles(is_admin)")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "プロフィールが見つかりません" };
  const isAdminUser = (profile.roles as unknown as { is_admin: boolean } | null)?.is_admin ?? false;
  if (!isAdminUser) return { error: "管理者のみロールを作成できます" };

  const { error } = await supabase
    .from("roles")
    .insert({ team_id: profile.team_id, name, is_admin: isAdmin });

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteRoleAction(roleId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const { error } = await supabase.from("roles").delete().eq("id", roleId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function assignRoleAction(profileId: string, roleId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role_id: roleId })
    .eq("id", profileId);

  if (error) return { error: error.message };
  return { success: true };
}
