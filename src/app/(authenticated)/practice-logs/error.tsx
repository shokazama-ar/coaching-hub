"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="space-y-3 text-center mt-8">
      <p className="text-sm text-gray-600">エラーが発生しました</p>
      <p className="text-xs text-gray-400">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white"
      >
        再試行
      </button>
    </div>
  );
}
