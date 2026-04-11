import { createClient } from "@/lib/supabase/server";
import PhasesManager from "./phases-manager";

export default async function PhasesPage() {
  const supabase = await createClient();
  const { data: phases } = await supabase
    .from("phases")
    .select("id, name, description, sort_order")
    .order("sort_order");

  return (
    <div className="space-y-4">
      <h1 className="text-base font-semibold text-gray-900">フェーズ管理</h1>
      <PhasesManager phases={phases ?? []} />
    </div>
  );
}
