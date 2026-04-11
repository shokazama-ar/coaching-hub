import AthleteForm from "@/components/athletes/athlete-form";

export default function NewAthletePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-base font-semibold text-gray-900">選手を追加</h1>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <AthleteForm />
      </div>
    </div>
  );
}
