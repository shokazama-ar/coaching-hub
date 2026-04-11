"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadMediaAction, deleteMediaAction } from "@/app/actions/sharing";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, Play } from "lucide-react";

type MediaItem = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  url: string | null;
};

export default function MediaSectionClient({
  logId,
  items,
}: {
  logId: string;
  items: MediaItem[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadMediaAction(logId, formData);
      if ("error" in result) setError(result.error);
      else {
        router.refresh();
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  };

  const handleDelete = (id: string, path: string) => {
    startTransition(async () => {
      const result = await deleteMediaAction(id, path, logId);
      if ("error" in result) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold text-gray-700">メディア</h2>

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => {
            const isVideo = item.mime_type?.startsWith("video/");
            return (
              <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                {isVideo ? (
                  <div className="flex h-full items-center justify-center">
                    <Play className="h-8 w-8 text-gray-400" />
                  </div>
                ) : item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <button
                  onClick={() => handleDelete(item.id, item.storage_path)}
                  disabled={isPending}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleUpload}
          className="hidden"
          id="media-upload"
        />
        <label htmlFor="media-upload">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            asChild
          >
            <span className="flex items-center gap-1.5 cursor-pointer">
              <ImagePlus className="h-3.5 w-3.5" />
              {isPending ? "アップロード中..." : "写真・動画を追加"}
            </span>
          </Button>
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
