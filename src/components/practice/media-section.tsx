import { createClient } from "@/lib/supabase/server";
import MediaSectionClient from "./media-section-client";

export default async function MediaSection({ logId }: { logId: string }) {
  const supabase = await createClient();

  const { data: mediaItems } = await supabase
    .from("log_media")
    .select("id, storage_path, mime_type")
    .eq("practice_log_id", logId)
    .order("inserted_at");

  // Get signed URLs
  const itemsWithUrls = await Promise.all(
    (mediaItems ?? []).map(async (item) => {
      const { data } = await supabase.storage
        .from("practice-media")
        .createSignedUrl(item.storage_path, 3600);
      return { ...item, url: data?.signedUrl ?? null };
    })
  );

  return (
    <MediaSectionClient
      logId={logId}
      items={itemsWithUrls}
    />
  );
}
