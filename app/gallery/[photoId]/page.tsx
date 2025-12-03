import { notFound } from "next/navigation";
import { getPhotoById } from "@/lib/gallery/queries";
import { PhotoDetailClient } from "../_components/PhotoDetailClient";
import type { Metadata } from "next";

interface PhotoDetailPageProps {
  params: Promise<{
    photoId: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PhotoDetailPageProps): Promise<Metadata> {
  const { photoId } = await params;
  
  try {
    const photo = await getPhotoById(photoId);
    
    if (!photo) {
      return {
        title: "Photo Not Found | dogrodOS Gallery",
      };
    }

    return {
      title: photo.title
        ? `${photo.title} | dogrodOS Gallery`
        : "Photo | dogrodOS Gallery",
      description: photo.description || "View photo in dogrodOS Gallery",
    };
  } catch {
    return {
      title: "Photo | dogrodOS Gallery",
    };
  }
}

export default async function PhotoDetailPage({ params }: PhotoDetailPageProps) {
  const { photoId } = await params;

  try {
    const photo = await getPhotoById(photoId);

    if (!photo) {
      notFound();
    }

    return <PhotoDetailClient photo={photo} />;
  } catch (error) {
    console.error("Failed to load photo:", error);
    notFound();
  }
}

