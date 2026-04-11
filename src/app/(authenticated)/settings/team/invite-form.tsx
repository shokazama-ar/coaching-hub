"use client";

import { useState, useTransition } from "react";
import { inviteCoachAction } from "@/app/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InviteForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await inviteCoachAction(formData);
      if ("error" in result) setError(result.error);
      else {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">招待メールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="coach@example.com"
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
          招待メールを送信しました
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "送信中..." : "招待メールを送信"}
      </Button>
    </form>
  );
}
