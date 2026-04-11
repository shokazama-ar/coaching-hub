"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSubjectAction,
  updateSubjectAction,
  toggleSubjectActiveAction,
} from "@/app/actions/subjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Pencil, Check, X } from "lucide-react";
import { CATEGORY_KIND_LABELS, type PracticeCategoryKind } from "@/types/database";

type Category = { id: string; kind: string; name: string; is_primary: boolean };
type Phase = { id: string; name: string };
type Subject = {
  id: string;
  title: string;
  category_id: string;
  phase_id: string | null;
  difficulty: number | null;
  is_active: boolean;
  categories: { kind: string; name: string } | null;
};

export default function SubjectsManager({
  subjects,
  categories,
  phases,
}: {
  subjects: Subject[];
  categories: Category[];
  phases: Phase[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterKind, setFilterKind] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const run = async (fn: () => Promise<{ error: string } | { success: true }>) => {
    setError(null);
    setIsPending(true);
    try {
      const result = await fn();
      if ("error" in result) {
        setError(result.error);
      } else {
        setEditingId(null);
        router.refresh();
      }
    } catch {
      setError("操作中にエラーが発生しました");
    } finally {
      setIsPending(false);
    }
  };

  const kinds = ["all", "up", "workout", "offense", "defense", "down"] as const;
  const filtered = filterKind === "all"
    ? subjects
    : subjects.filter((s) => s.categories?.kind === filterKind);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setFilterKind(k)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
              filterKind === k
                ? "bg-indigo-500 text-white"
                : "bg-white text-gray-600 shadow-sm"
            }`}
          >
            {k === "all" ? "すべて" : CATEGORY_KIND_LABELS[k as PracticeCategoryKind]}
          </button>
        ))}
      </div>

      {/* Subject list */}
      <div className="rounded-2xl bg-white p-4 shadow-sm space-y-2">
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400">Subjectがありません</p>
        )}
        <ul className="space-y-2">
          {filtered.map((subject) => (
            <li key={subject.id} className="rounded-xl bg-gray-50 px-3 py-2">
              {editingId === subject.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(() => updateSubjectAction(new FormData(e.currentTarget)));
                  }}
                  className="space-y-2"
                >
                  <input type="hidden" name="id" value={subject.id} />
                  <Input name="title" defaultValue={subject.title} required />
                  <select
                    name="category_id"
                    defaultValue={subject.category_id}
                    className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {CATEGORY_KIND_LABELS[c.kind as PracticeCategoryKind]} / {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="phase_id"
                    defaultValue={subject.phase_id ?? ""}
                    className="w-full rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-xs"
                  >
                    <option value="">フェーズ未設定</option>
                    {phases.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isPending}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className={`text-sm font-medium ${subject.is_active ? "text-gray-800" : "text-gray-400 line-through"}`}>
                      {subject.title}
                    </p>
                    {subject.categories && (
                      <p className="text-[10px] text-gray-400">
                        {CATEGORY_KIND_LABELS[subject.categories.kind as PracticeCategoryKind]} / {subject.categories.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => run(() => toggleSubjectActiveAction(subject.id, !subject.is_active))}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        subject.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                      disabled={isPending}
                    >
                      {subject.is_active ? "有効" : "無効"}
                    </button>
                    <button
                      onClick={() => setEditingId(subject.id)}
                      className="p-1 text-gray-400 hover:text-indigo-500"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <Separator />

        {/* Add new subject */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => createSubjectAction(fd));
            (e.target as HTMLFormElement).reset();
          }}
          className="space-y-2"
        >
          <p className="text-xs font-medium text-gray-600">新しい Subject を追加</p>
          <Input name="title" placeholder="タイトル（例: 2メン）" required />
          <select
            name="category_id"
            defaultValue=""
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-sm"
          >
            <option value="" disabled>カテゴリを選択</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {CATEGORY_KIND_LABELS[c.kind as PracticeCategoryKind]} / {c.name}
              </option>
            ))}
          </select>
          <select
            name="phase_id"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-sm"
          >
            <option value="">フェーズ未設定</option>
            {phases.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Button type="submit" size="sm" disabled={isPending || categories.length === 0}>
            追加
          </Button>
          {categories.length === 0 && (
            <p className="text-xs text-amber-600">カテゴリがありません。チームを作成するとカテゴリが自動生成されます。</p>
          )}
        </form>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
