import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClipboardList, Users, Settings, Plus } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, team_id, teams(name)")
    .eq("id", user.id)
    .single();

  const { data: recentLogs } = await supabase
    .from("practice_logs")
    .select("id, practice_date, title")
    .order("practice_date", { ascending: false })
    .limit(3);

  const teamName = (profile?.teams as unknown as { name: string } | null)?.name ?? "チーム";

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-xs text-gray-400">ようこそ</p>
        <h1 className="text-lg font-bold text-gray-900">
          {profile?.display_name ?? "コーチ"}さん
        </h1>
        <p className="text-xs text-gray-500">{teamName}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/practice-logs/new"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-indigo-500 p-4 text-white shadow-sm"
        >
          <Plus className="h-6 w-6" />
          <span className="text-xs font-semibold">練習ログを作成</span>
        </Link>
        <Link
          href="/athletes"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-4 text-gray-700 shadow-sm"
        >
          <Users className="h-6 w-6 text-indigo-500" />
          <span className="text-xs font-semibold">選手管理</span>
        </Link>
      </div>

      {/* Recent logs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">最近の練習ログ</h2>
          <Link href="/practice-logs" className="text-xs text-indigo-500">
            すべて見る
          </Link>
        </div>
        {recentLogs && recentLogs.length > 0 ? (
          <ul className="space-y-2">
            {recentLogs.map((log) => (
              <li key={log.id}>
                <Link
                  href={`/practice-logs/${log.id}`}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm"
                >
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {log.title || "タイトル未設定"}
                  </p>
                  <p className="shrink-0 text-xs text-gray-400 ml-2">
                    {new Date(log.practice_date).toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-white px-4 py-6 text-center shadow-sm">
            <p className="text-xs text-gray-400">まだ練習ログがありません</p>
            <Link
              href="/practice-logs/new"
              className="mt-2 inline-block text-xs font-semibold text-indigo-500"
            >
              最初のログを作成する →
            </Link>
          </div>
        )}
      </div>

      {/* Settings links */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">設定</h2>
        <div className="rounded-2xl bg-white divide-y shadow-sm">
          {[
            { href: "/settings/phases", label: "フェーズ管理" },
            { href: "/settings/subjects", label: "Subject管理" },
            { href: "/settings/team", label: "チーム設定" },
            { href: "/settings/roles", label: "ロール管理" },
            { href: "/settings/profile", label: "プロフィール" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-4 py-3 text-sm text-gray-700"
            >
              {label}
              <span className="text-gray-300">›</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
