import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AthleteForm from "@/components/athletes/athlete-form";

export default async function EditAthletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: athlete } = await supabase
    .from("athletes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!athlete) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-base font-semibold text-gray-900">選手を編集</h1>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <AthleteForm athlete={athlete} />
      </div>
    </div>
  );
}
