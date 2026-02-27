"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_SITE_URL ??
            "http://localhost:3000/auth/callback",
        },
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      setMessage("ログイン用のメールを送信しました。メールを確認してください。");
    } catch (err) {
      setError("ログイン処理でエラーが発生しました。環境変数とSupabase設定を確認してください。");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">コーチログイン</h1>
        <p className="text-xs text-gray-500">
          チーム管理者から招待されたメールアドレスでログインします。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="space-y-1 text-sm">
          <span className="block text-xs font-medium text-gray-600">
            メールアドレス
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none ring-0 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            placeholder="coach@example.com"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {pending ? "送信中..." : "ログインリンクを送信"}
        </button>
      </form>

      {message && (
        <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          {message}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-gray-400">
        ※ Supabase プロジェクトを作成し、環境変数
        <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-[10px]">
          NEXT_PUBLIC_SUPABASE_URL
        </code>
        と
        <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-[10px]">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>
        を設定すると実際の認証が動作します。
      </p>
    </div>
  );
}

