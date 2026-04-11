"use client";

import { useState, useTransition } from "react";
import { updateTeamAction } from "@/app/actions/team-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TeamSettingsForm({
  teamId,
  name,
  description,
}: {
  teamId: string;
  name: string;
  description: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateTeamAction(formData);
      if ("error" in result) setError(result.error);
      else setSuccess(true);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="team_id" value={teamId} />
      <div className="space-y-1.5">
        <Label htmlFor="name">チーム名</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">説明（任意）</Label>
        <Textarea id="description" name="description" defaultValue={description} rows={3} />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-600">
          更新しました
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "保存中..." : "保存"}
      </Button>
    </form>
  );
}
