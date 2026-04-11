import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";

type PracticeLogRow = {
  id: string;
  practice_date: string;
  title: string | null;
  daily_reflection: string | null;
  phases: { name: string } | null;
};

export default async function PracticeLogsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("practice_logs")
    .select("id, practice_date, title, daily_reflection, phases(name)")
    .order("practice_date", { ascending: false })
    .limit(50);

  const logs = (data ?? []) as unknown as PracticeLogRow[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-900">練習ログ</h1>
        <Link
          href="/practice-logs/new"
          className="flex items-center gap-1 rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          新しいログ
        </Link>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          データを取得できませんでした。Supabase の設定を確認してください。
        </p>
      )}

      {logs.length === 0 && !error && (
        <div className="mt-12 text-center space-y-3">
          <p className="text-sm text-gray-500">まだ練習ログがありません</p>
          <Link
            href="/practice-logs/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            最初のログを作成する
          </Link>
        </div>
      )}

      <ul className="space-y-2">
        {logs.map((log) => (
          <li key={log.id}>
            <Link
              href={`/practice-logs/${log.id}`}
              className="flex items-start justify-between rounded-2xl bg-white px-4 py-3 text-left shadow-sm"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-gray-400">
                    {new Date(log.practice_date).toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </p>
                  {log.phases && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
                      {log.phases.name}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {log.title || "タイトル未設定"}
                </p>
                {log.daily_reflection && (
                  <p className="line-clamp-2 text-xs text-gray-400">
                    {log.daily_reflection}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
