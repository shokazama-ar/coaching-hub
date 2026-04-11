"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAthleteAction, updateAthleteAction } from "@/app/actions/athletes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Athlete } from "@/types/database";

const GRADE_BANDS = ["低学年", "高学年"];
const GROUP_LABELS = ["Aチーム", "Bチーム"];

export default function AthleteForm({ athlete }: { athlete?: Partial<Athlete> }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!athlete?.id;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const action = isEdit ? updateAthleteAction : createAthleteAction;
      const result = await action(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.push("/athletes");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={athlete!.id} />}

      <div className="space-y-1.5">
        <Label htmlFor="nickname">ニックネーム *</Label>
        <Input
          id="nickname"
          name="nickname"
          defaultValue={athlete?.nickname}
          placeholder="例: たろう"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="grade_band">学年区分</Label>
          <select
            id="grade_band"
            name="grade_band"
            defaultValue={athlete?.grade_band ?? ""}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          >
            <option value="">未設定</option>
            {GRADE_BANDS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="group_label">グループ</Label>
          <select
            id="group_label"
            name="group_label"
            defaultValue={athlete?.group_label ?? ""}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          >
            <option value="">未設定</option>
            {GROUP_LABELS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="number">背番号</Label>
        <Input
          id="number"
          name="number"
          type="number"
          min="0"
          max="99"
          defaultValue={athlete?.number ?? ""}
          placeholder="例: 10"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="memo">メモ（任意）</Label>
        <Textarea
          id="memo"
          name="memo"
          rows={3}
          defaultValue={athlete?.memo ?? ""}
          placeholder="特記事項など"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "保存中..." : isEdit ? "更新" : "登録"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
