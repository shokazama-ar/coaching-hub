"use client";

import { useState } from "react";
import { CATEGORY_KIND_LABELS, type PracticeCategoryKind } from "@/types/database";
import { Plus } from "lucide-react";

type Category = { id: string; kind: string; name: string; is_primary: boolean };
type Subject = { id: string; title: string; category_id: string };

type SelectedSubject = {
  subject_id: string;
  title: string;
  block_order: number;
  duration_minutes: number | null;
  memo: string | null;
};

const KINDS: PracticeCategoryKind[] = ["up", "workout", "offense", "defense", "down"];

export default function SubjectSelector({
  categories,
  subjects,
  selected,
  onUpdate,
}: {
  categories: Category[];
  subjects: Subject[];
  selected: SelectedSubject[];
  onUpdate: (items: SelectedSubject[]) => void;
}) {
  const [activeKind, setActiveKind] = useState<PracticeCategoryKind>("up");

  const categoriesForKind = categories.filter((c) => c.kind === activeKind);
  const subjectsForKind = subjects.filter((s) =>
    categoriesForKind.some((c) => c.id === s.category_id)
  );
  const selectedIds = new Set(selected.map((s) => s.subject_id));

  const addSubject = (subject: Subject) => {
    if (selectedIds.has(subject.id)) return;
    onUpdate([
      ...selected,
      {
        subject_id: subject.id,
        title: subject.title,
        block_order: selected.length,
        duration_minutes: null,
        memo: null,
      },
    ]);
  };

  return (
    <div className="space-y-3">
      {/* Kind tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setActiveKind(k)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
              activeKind === k
                ? "bg-indigo-500 text-white"
                : "bg-white text-gray-600 shadow-sm"
            }`}
          >
            {CATEGORY_KIND_LABELS[k]}
          </button>
        ))}
      </div>

      {/* Subject grid */}
      <div className="flex flex-wrap gap-2">
        {subjectsForKind.length === 0 && (
          <p className="text-xs text-gray-400">
            このカテゴリにSubjectがありません。設定 → Subject管理から追加できます。
          </p>
        )}
        {subjectsForKind.map((subject) => {
          const isSelected = selectedIds.has(subject.id);
          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => addSubject(subject)}
              disabled={isSelected}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? "bg-indigo-100 text-indigo-400 cursor-not-allowed"
                  : "bg-white text-gray-700 shadow-sm hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              {!isSelected && <Plus className="h-3 w-3" />}
              {subject.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
