import type { Metadata } from "next";
import { GalleryHeader } from "./_components/GalleryHeader";
import { PhotoContextProvider } from "./_components/PhotoContext";

export const metadata: Metadata = {
  title: "Gallery | dogrodOS",
  description: "Photo gallery - Browse and explore photos",
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PhotoContextProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <GalleryHeader />
        <main className="pt-16">{children}</main>
      </div>
    </PhotoContextProvider>
  );
}


