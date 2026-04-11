import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";

export default async function AthletesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("athletes")
    .select("id, nickname, grade_band, group_label, number, is_active")
    .order("nickname");

  const athletes = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-900">選手一覧</h1>
        <Link
          href="/athletes/new"
          className="flex items-center gap-1 rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
        >
          <UserPlus className="h-3.5 w-3.5" />
          選手を追加
        </Link>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
          データを取得できませんでした
        </p>
      )}

      {athletes.length === 0 && !error && (
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-500">まだ選手が登録されていません</p>
          <Link
            href="/athletes/new"
            className="inline-block rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white"
          >
            最初の選手を追加する
          </Link>
        </div>
      )}

      <ul className="space-y-2">
        {athletes.map((a) => (
          <li key={a.id}>
            <Link
              href={`/athletes/${a.id}/edit`}
              className="flex items-center justify-between rounded-2xl bg-white px-3 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                  {a.number ?? "—"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{a.nickname}</p>
                  <p className="text-xs text-gray-400">
                    {[a.grade_band, a.group_label].filter(Boolean).join(" / ") || "区分未設定"}
                  </p>
                </div>
              </div>
              {!a.is_active && (
                <Badge variant="outline" className="text-[10px]">
                  非表示
                </Badge>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
