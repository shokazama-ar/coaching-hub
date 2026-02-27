import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PracticeLogDetail = {
  id: string;
  practice_date: string;
  title: string | null;
  daily_reflection: string | null;
};

export default async function PracticeLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("practice_logs")
    .select("id, practice_date, title, daily_reflection")
    .eq("id", id)
    .maybeSingle<PracticeLogDetail>();

  if (error) {
    // RLS で見えない場合なども含め 404 相当にする
    notFound();
  }

  if (!data) {
    notFound();
  }

  const dateLabel = new Date(data.practice_date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500">{dateLabel}</p>
        <h1 className="text-base font-semibold text-gray-900">
          {data.title || "タイトル未設定"}
        </h1>
      </div>

      <section className="space-y-2 rounded-2xl bg-white p-3 shadow-sm">
        <h2 className="text-xs font-semibold text-gray-700">
          Daily Reflection
        </h2>
        <p className="min-h-[60px] whitespace-pre-wrap text-xs text-gray-700">
          {data.daily_reflection || "まだ所感は記入されていません。"}
        </p>
      </section>

      <section className="space-y-2 rounded-2xl bg-white p-3 shadow-sm">
        <h2 className="text-xs font-semibold text-gray-700">
          個別メモ（Individual Note）
        </h2>
        <p className="text-xs text-gray-400">
          ここに選手ごとの良かった点やフォーカスポイントを一覧表示する予定です。
          Step 2 以降で{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">
            individual_notes
          </code>
          テーブルと連携させます。
        </p>
      </section>
    </div>
  );
}

