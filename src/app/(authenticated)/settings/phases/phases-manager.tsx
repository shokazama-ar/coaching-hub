"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPhaseAction,
  updatePhaseAction,
  deletePhaseAction,
  movePhaseAction,
} from "@/app/actions/phases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Trash2, ChevronUp, ChevronDown, Pencil, Check, X } from "lucide-react";

type Phase = { id: string; name: string; description: string | null; sort_order: number };

export default function PhasesManager({ phases: initial }: { phases: Phase[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
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
        router.refresh();
      }
    } catch {
      setError("操作中にエラーが発生しました");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm space-y-2">
        {initial.length === 0 && (
          <p className="text-xs text-gray-400">フェーズがありません。以下から追加してください。</p>
        )}
        <ul className="space-y-2">
          {initial.map((phase, idx) => (
            <li key={phase.id} className="rounded-xl bg-gray-50 px-3 py-2 space-y-2">
              {editingId === phase.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    run(() => updatePhaseAction(fd));
                    setEditingId(null);
                  }}
                  className="space-y-2"
                >
                  <input type="hidden" name="id" value={phase.id} />
                  <Input name="name" defaultValue={phase.name} required />
                  <Textarea name="description" defaultValue={phase.description ?? ""} rows={2} placeholder="説明（任意）" />
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
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{phase.name}</p>
                    {phase.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{phase.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => run(() => movePhaseAction(phase.id, "up"))}
                      disabled={isPending || idx === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => run(() => movePhaseAction(phase.id, "down"))}
                      disabled={isPending || idx === initial.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(phase.id)}
                      className="p-1 text-gray-400 hover:text-indigo-500"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => run(() => deletePhaseAction(phase.id))}
                      disabled={isPending}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <Separator />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => createPhaseAction(fd));
            (e.target as HTMLFormElement).reset();
          }}
          className="space-y-2"
        >
          <p className="text-xs font-medium text-gray-600">新しいフェーズを追加</p>
          <Input name="name" placeholder="フェーズ名（例: 1on1強化）" required />
          <Textarea name="description" placeholder="説明（任意）" rows={2} />
          <Button type="submit" size="sm" disabled={isPending}>
            追加
          </Button>
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
