"use client";

import { useState, useTransition } from "react";
import { toggleReactionAction } from "@/app/actions/sharing";
import { REACTION_TYPES, REACTION_LABELS, type ReactionType } from "@/types/database";

export default function ReactionBar({
  logId,
  reactionCounts,
  myReactionTypes,
}: {
  logId: string;
  reactionCounts: Record<string, number>;
  myReactionTypes: Set<string>;
}) {
  const [counts, setCounts] = useState(reactionCounts);
  const [mine, setMine] = useState(myReactionTypes);
  const [isPending, startTransition] = useTransition();

  const toggle = (type: ReactionType) => {
    startTransition(async () => {
      const wasActive = mine.has(type);
      // Optimistic update
      setCounts((prev) => ({
        ...prev,
        [type]: (prev[type] ?? 0) + (wasActive ? -1 : 1),
      }));
      setMine((prev) => {
        const next = new Set(prev);
        if (wasActive) next.delete(type);
        else next.add(type);
        return next;
      });

      const result = await toggleReactionAction(logId, type);
      // Rollback on error (server will revalidate anyway)
      if ("error" in result) {
        setCounts((prev) => ({
          ...prev,
          [type]: (prev[type] ?? 0) + (wasActive ? 1 : -1),
        }));
        setMine((prev) => {
          const next = new Set(prev);
          if (wasActive) next.add(type);
          else next.delete(type);
          return next;
        });
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {REACTION_TYPES.map((type) => {
        const isActive = mine.has(type);
        const count = counts[type] ?? 0;
        return (
          <button
            key={type}
            onClick={() => toggle(type)}
            disabled={isPending}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              isActive
                ? "bg-indigo-500 text-white"
                : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"
            }`}
          >
            {REACTION_LABELS[type]}
            {count > 0 && (
              <span className={`text-[10px] ${isActive ? "text-indigo-200" : "text-gray-400"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
