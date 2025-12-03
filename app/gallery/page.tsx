import { getGalleryPhotos, getTimeAxisData } from "@/lib/gallery/queries";
import { GalleryListClient } from "./_components/GalleryListClient";
import { GalleryError } from "./_components/GalleryError";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  try {
    // Fetch initial data server-side
    const [photosResult, timeAxisData] = await Promise.all([
      getGalleryPhotos(),
      getTimeAxisData(),
    ]);

    return (
      <GalleryListClient
        initialPhotos={photosResult.photos}
        initialCursor={photosResult.nextCursor}
        initialHasMore={photosResult.hasMore}
        timeAxisData={timeAxisData}
      />
    );
  } catch (error) {
    console.error("Failed to load gallery:", error);
    return <GalleryError />;
  }
}

