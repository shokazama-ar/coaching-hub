"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/app/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfileForm({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
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
      const result = await updateProfileAction(formData);
      if ("error" in result) setError(result.error);
      else setSuccess(true);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>メールアドレス</Label>
        <p className="text-sm text-gray-700">{email}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="display_name">表示名</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={displayName}
          required
        />
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
