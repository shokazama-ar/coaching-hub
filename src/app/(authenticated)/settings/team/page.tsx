import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TeamSettingsForm from "./team-settings-form";
import InviteForm from "./invite-form";

export default async function TeamSettingsPage() {
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

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, description")
    .eq("id", profile!.team_id)
    .single();

  return (
    <div className="space-y-6">
      <h1 className="text-base font-semibold text-gray-900">チーム設定</h1>

      <div className="rounded-2xl bg-white p-4 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">チーム情報</h2>
        <TeamSettingsForm
          teamId={team?.id ?? ""}
          name={team?.name ?? ""}
          description={team?.description ?? ""}
        />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">コーチ招待</h2>
        <InviteForm />
      </div>
    </div>
  );
}
