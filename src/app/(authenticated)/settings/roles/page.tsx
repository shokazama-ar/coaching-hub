import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RolesManager from "./roles-manager";

export default async function RolesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id, role_id, roles(is_admin)")
    .eq("id", user.id)
    .single();

  const isAdmin = (profile?.roles as unknown as { is_admin: boolean } | null)?.is_admin ?? false;
  if (!isAdmin) redirect("/");

  const teamId = profile!.team_id;

  const [rolesRes, membersRes] = await Promise.all([
    supabase
      .from("roles")
      .select("id, name, is_admin")
      .eq("team_id", teamId)
      .order("inserted_at"),
    supabase
      .from("profiles")
      .select("id, display_name, role_id")
      .eq("team_id", teamId),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-base font-semibold text-gray-900">ロール管理</h1>
      <RolesManager
        roles={rolesRes.data ?? []}
        members={membersRes.data ?? []}
        teamId={teamId}
      />
    </div>
  );
}
