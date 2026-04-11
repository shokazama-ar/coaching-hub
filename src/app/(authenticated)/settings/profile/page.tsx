import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-4">
      <h1 className="text-base font-semibold text-gray-900">プロフィール設定</h1>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <ProfileForm
          displayName={profile?.display_name ?? ""}
          email={user.email ?? ""}
        />
      </div>
    </div>
  );
}
