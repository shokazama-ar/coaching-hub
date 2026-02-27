import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type PracticeLogRow = {
  id: string;
  practice_date: string;
  title: string | null;
  daily_reflection: string | null;
};

export default async function PracticeLogsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("practice_logs")
    .select("id, practice_date, title, daily_reflection")
    .order("practice_date", { ascending: false })
    .limit(30);

  const logs = (data ?? []) as PracticeLogRow[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-900">
          練習ログ
        </h1>
        <Link
          href="#"
          className="rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
        >
          新しいログ
        </Link>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          Supabase から練習ログを取得できませんでした。スキーマ適用と RLS 設定、チーム紐づけを確認してください。
        </p>
      )}

      <ul className="space-y-2">
        {logs.map((log) => (
          <li key={log.id}>
            <Link
              href={`/practice-logs/${log.id}`}
              className="flex items-start justify-between rounded-2xl bg-white px-3 py-3 text-left shadow-sm"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">
                  {new Date(log.practice_date).toLocaleDateString("ja-JP", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  })}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {log.title || "タイトル未設定"}
                </p>
                {log.daily_reflection && (
                  <p className="line-clamp-2 text-xs text-gray-500">
                    {log.daily_reflection}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {!logs.length && !error && (
        <p className="mt-8 text-center text-xs text-gray-400">
          まだ練習ログがありません。まずは Supabase で
          <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-[10px]">
            practice_logs
          </code>
          テーブルを作成し、最初のデータを投入して動作確認してみてください。
        </p>
      )}
    </div>
  );
}

