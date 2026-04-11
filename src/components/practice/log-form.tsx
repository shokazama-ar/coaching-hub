"use client";

import { useState, useTransition } from "react";
import { createPracticeLogAction, updatePracticeLogAction, type LogSubjectInput } from "@/app/actions/practice-logs";
import SubjectSelector from "./subject-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";

type Category = { id: string; kind: string; name: string; is_primary: boolean };
type Subject = { id: string; title: string; category_id: string };
type Phase = { id: string; name: string };

type SelectedSubject = {
  subject_id: string;
  title: string;
  block_order: number;
  duration_minutes: number | null;
  memo: string | null;
};

type ExistingLog = {
  id: string;
  practice_date: string;
  title: string | null;
  phase_id: string | null;
  daily_reflection: string | null;
  practice_log_subjects?: {
    id: string;
    subject_id: string;
    block_order: number;
    duration_minutes: number | null;
    memo: string | null;
    subjects: { id: string; title: string; category_id: string } | null;
  }[];
};

export default function LogForm({
  categories,
  subjects,
  phases,
  existing,
}: {
  categories: Category[];
  subjects: Subject[];
  phases: Phase[];
  existing?: ExistingLog;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initialSelected: SelectedSubject[] = (existing?.practice_log_subjects ?? [])
    .sort((a, b) => a.block_order - b.block_order)
    .map((ls) => ({
      subject_id: ls.subject_id,
      title: ls.subjects?.title ?? "(不明)",
      block_order: ls.block_order,
      duration_minutes: ls.duration_minutes,
      memo: ls.memo,
    }));

  const [selectedSubjects, setSelectedSubjects] = useState<SelectedSubject[]>(initialSelected);

  const updateSubject = (idx: number, patch: Partial<SelectedSubject>) => {
    setSelectedSubjects((prev) => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  };

  const removeSubject = (idx: number) => {
    setSelectedSubjects((prev) =>
      prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, block_order: i }))
    );
  };

  const moveSubject = (idx: number, dir: "up" | "down") => {
    const next = [...selectedSubjects];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setSelectedSubjects(next.map((s, i) => ({ ...s, block_order: i })));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const subjectInputs: LogSubjectInput[] = selectedSubjects.map((s, i) => ({
      subject_id: s.subject_id,
      block_order: i,
      duration_minutes: s.duration_minutes,
      memo: s.memo,
    }));

    startTransition(async () => {
      const result = existing
        ? await updatePracticeLogAction(existing.id, formData, subjectInputs)
        : await createPracticeLogAction(formData, subjectInputs);

      if (result && "error" in result) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="practice_date">日付 *</Label>
        <Input
          id="practice_date"
          name="practice_date"
          type="date"
          defaultValue={existing?.practice_date ?? new Date().toISOString().slice(0, 10)}
          required
        />
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">タイトル（任意）</Label>
        <Input
          id="title"
          name="title"
          defaultValue={existing?.title ?? ""}
          placeholder="例: 春季大会前の最終調整"
        />
      </div>

      {/* Phase */}
      <div className="space-y-1.5">
        <Label htmlFor="phase_id">フェーズ</Label>
        <select
          id="phase_id"
          name="phase_id"
          defaultValue={existing?.phase_id ?? ""}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
        >
          <option value="">フェーズ未設定</option>
          {phases.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <Separator />

      {/* Subject selector */}
      <div className="space-y-2">
        <Label>練習メニュー（Subject）</Label>
        <div className="rounded-2xl bg-gray-50 p-3">
          <SubjectSelector
            categories={categories}
            subjects={subjects}
            selected={selectedSubjects}
            onUpdate={setSelectedSubjects}
          />
        </div>
      </div>

      {/* Selected subjects */}
      {selectedSubjects.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">追加したメニュー</p>
          <ul className="space-y-2">
            {selectedSubjects.map((s, idx) => (
              <li key={s.subject_id} className="rounded-xl bg-white p-3 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">{s.title}</p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSubject(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSubject(idx, "down")}
                      disabled={idx === selectedSubjects.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSubject(idx)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="space-y-0.5 flex-1">
                    <p className="text-[10px] text-gray-500">時間（分）</p>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={s.duration_minutes ?? ""}
                      onChange={(e) =>
                        updateSubject(idx, {
                          duration_minutes: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      placeholder="例: 15"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-gray-500">メモ</p>
                  <textarea
                    value={s.memo ?? ""}
                    onChange={(e) => updateSubject(idx, { memo: e.target.value || null })}
                    placeholder="気づき・指導ポイントなど"
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs resize-none"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Separator />

      {/* Daily reflection */}
      <div className="space-y-1.5">
        <Label htmlFor="daily_reflection">Daily Reflection</Label>
        <Textarea
          id="daily_reflection"
          name="daily_reflection"
          rows={5}
          defaultValue={existing?.daily_reflection ?? ""}
          placeholder="今日の練習全体を振り返って..."
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "保存中..." : existing ? "更新" : "練習ログを作成"}
      </Button>
    </form>
  );
}
