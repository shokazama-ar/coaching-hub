"use client";

import { useState, useTransition } from "react";
import { createTeamAction } from "@/app/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createTeamAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-bold text-gray-900">チームを作成</h1>
          <p className="text-sm text-gray-500">
            最初のコーチとしてチームを登録します。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">チーム名</Label>
            <Input
              id="name"
              name="name"
              placeholder="例: ○○ミニバスBC"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="display_name">あなたの表示名</Label>
            <Input
              id="display_name"
              name="display_name"
              placeholder="例: 山田コーチ"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "作成中..." : "チームを作成してはじめる"}
          </Button>
        </form>
      </div>
    </div>
  );
}
