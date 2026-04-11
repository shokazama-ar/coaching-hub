import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Pencil } from "lucide-react";
import { CATEGORY_KIND_LABELS, type PracticeCategoryKind } from "@/types/database";
import ReactionBar from "@/components/practice/reaction-bar";
import IndividualNoteSection from "@/components/practice/individual-note-section";
import MediaSection from "@/components/practice/media-section";

export default async function PracticeLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [logRes, notesRes, reactionsRes, athletesRes, myReactionsRes] = await Promise.all([
    supabase
      .from("practice_logs")
      .select(`
        id, practice_date, title, daily_reflection, created_by,
        phases (name),
        practice_log_subjects (
          id, block_order, duration_minutes, memo,
          subjects (id, title, categories (kind, name))
        )
      `)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("individual_notes")
      .select("id, athlete_id, content, positive_points, focus_points, athletes(nickname)")
      .eq("practice_log_id", id)
      .order("inserted_at"),
    supabase
      .from("reactions")
      .select("type")
      .eq("practice_log_id", id),
    supabase.from("athletes").select("id, nickname").eq("is_active", true).order("nickname"),
    user
      ? supabase.from("reactions").select("type").eq("practice_log_id", id).eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
  ]);

  if (!logRes.data) notFound();

  const log = logRes.data;
  const notes = notesRes.data ?? [];
  const athletes = athletesRes.data ?? [];

  // Count reactions by type
  const reactionCounts: Record<string, number> = {};
  for (const r of reactionsRes.data ?? []) {
    reactionCounts[r.type] = (reactionCounts[r.type] ?? 0) + 1;
  }
  const myReactionTypes = new Set((myReactionsRes.data ?? []).map((r: { type: string }) => r.type));

  const dateLabel = new Date(log.practice_date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  const sortedSubjects = [...(log.practice_log_subjects ?? [])].sort(
    (a, b) => a.block_order - b.block_order
  );

  const isAuthor = user?.id === log.created_by;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-gray-400">{dateLabel}</p>
            {(log.phases as unknown as { name: string } | null)?.name && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
                {(log.phases as unknown as { name: string }).name}
              </span>
            )}
          </div>
          <h1 className="text-base font-semibold text-gray-900">
            {log.title || "タイトル未設定"}
          </h1>
        </div>
        {isAuthor && (
          <Link
            href={`/practice-logs/${id}/edit`}
            className="flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
          >
            <Pencil className="h-3.5 w-3.5" />
            編集
          </Link>
        )}
      </div>

      {/* Reactions */}
      <ReactionBar
        logId={id}
        reactionCounts={reactionCounts}
        myReactionTypes={myReactionTypes}
      />

      {/* Subjects */}
      {sortedSubjects.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-600">練習メニュー</h2>
          <ul className="space-y-2">
            {sortedSubjects.map((ls, idx) => {
              const subject = ls.subjects as unknown as {
                id: string;
                title: string;
                categories: { kind: string; name: string } | null;
              } | null;
              return (
                <li key={ls.id} className="rounded-2xl bg-white px-4 py-3 shadow-sm space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {idx + 1}. {subject?.title ?? "(不明)"}
                      </p>
                      {subject?.categories && (
                        <p className="text-[10px] text-gray-400">
                          {CATEGORY_KIND_LABELS[subject.categories.kind as PracticeCategoryKind]} / {subject.categories.name}
                        </p>
                      )}
                    </div>
                    {ls.duration_minutes && (
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        {ls.duration_minutes}分
                      </span>
                    )}
                  </div>
                  {ls.memo && (
                    <p className="whitespace-pre-wrap text-xs text-gray-600">{ls.memo}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Daily reflection */}
      <section className="rounded-2xl bg-white p-4 shadow-sm space-y-2">
        <h2 className="text-xs font-semibold text-gray-700">Daily Reflection</h2>
        <p className="min-h-[60px] whitespace-pre-wrap text-xs text-gray-700">
          {log.daily_reflection || "まだ所感は記入されていません。"}
        </p>
      </section>

      {/* Media */}
      <MediaSection logId={id} />

      {/* Individual notes */}
      <IndividualNoteSection
        logId={id}
        athletes={athletes}
        notes={notes as unknown as Parameters<typeof IndividualNoteSection>[0]["notes"]}
      />
    </div>
  );
}
