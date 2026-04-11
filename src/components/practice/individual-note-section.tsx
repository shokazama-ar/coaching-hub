"use client";

import { useState, useTransition } from "react";
import { saveIndividualNoteAction } from "@/app/actions/sharing";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type Athlete = { id: string; nickname: string };
type Note = {
  id: string;
  athlete_id: string;
  content: string;
  positive_points: string | null;
  focus_points: string | null;
  athletes: { nickname: string } | null;
};

export default function IndividualNoteSection({
  logId,
  athletes,
  notes,
}: {
  logId: string;
  athletes: Athlete[];
  notes: Note[];
}) {
  const router = useRouter();
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const existingNote = notes.find((n) => n.athlete_id === selectedAthleteId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveIndividualNoteAction(logId, formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold text-gray-700">個別メモ（Individual Note）</h2>

      {/* Saved notes */}
      {notes.length > 0 && (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id} className="rounded-2xl bg-white p-3 shadow-sm space-y-2">
              <p className="text-xs font-semibold text-indigo-600">
                {note.athletes?.nickname ?? "不明"}
              </p>
              {note.positive_points && (
                <div>
                  <p className="text-[10px] font-medium text-gray-500">良かった点</p>
                  <p className="whitespace-pre-wrap text-xs text-gray-700">{note.positive_points}</p>
                </div>
              )}
              {note.focus_points && (
                <div>
                  <p className="text-[10px] font-medium text-gray-500">着目点</p>
                  <p className="whitespace-pre-wrap text-xs text-gray-700">{note.focus_points}</p>
                </div>
              )}
              {note.content && !(note.positive_points || note.focus_points) && (
                <p className="whitespace-pre-wrap text-xs text-gray-700">{note.content}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add/edit note */}
      {athletes.length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
          <p className="text-xs font-medium text-gray-600">メモを追加・編集</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="athlete_id">選手</Label>
              <select
                id="athlete_id"
                name="athlete_id"
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              >
                <option value="">選手を選択</option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>{a.nickname}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="positive_points">良かった点</Label>
              <Textarea
                id="positive_points"
                name="positive_points"
                rows={2}
                defaultValue={existingNote?.positive_points ?? ""}
                placeholder="今日うまくできていたこと..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="focus_points">着目点</Label>
              <Textarea
                id="focus_points"
                name="focus_points"
                rows={2}
                defaultValue={existingNote?.focus_points ?? ""}
                placeholder="次回意識してほしいこと..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">全体メモ *</Label>
              <Textarea
                id="content"
                name="content"
                rows={3}
                required
                defaultValue={existingNote?.content ?? ""}
                placeholder="メモ内容"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" size="sm" disabled={isPending || !selectedAthleteId}>
              {isPending ? "保存中..." : existingNote ? "更新" : "保存"}
            </Button>
          </form>
        </div>
      )}

      {athletes.length === 0 && notes.length === 0 && (
        <p className="text-xs text-gray-400">
          選手を登録すると個別メモを追加できます。
        </p>
      )}
    </section>
  );
}
