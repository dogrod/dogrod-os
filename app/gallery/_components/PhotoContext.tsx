"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface PhotoContextValue {
  /** Current photo ID for download tracking */
  photoId: string | null;
  /** URL for downloading the original/highest quality image */
  downloadUrl: string | null;
  /** Set the current photo info */
  setPhotoInfo: (photoId: string, downloadUrl: string) => void;
  /** Clear the photo info (when leaving detail page) */
  clearPhotoInfo: () => void;
}

const PhotoContext = createContext<PhotoContextValue | null>(null);

export function PhotoContextProvider({ children }: { children: ReactNode }) {
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const setPhotoInfo = useCallback((id: string, url: string) => {
    setPhotoId(id);
    setDownloadUrl(url);
  }, []);

  const clearPhotoInfo = useCallback(() => {
    setPhotoId(null);
    setDownloadUrl(null);
  }, []);

  return (
    <PhotoContext.Provider value={{ photoId, downloadUrl, setPhotoInfo, clearPhotoInfo }}>
      {children}
    </PhotoContext.Provider>
  );
}

export function usePhotoContext() {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhotoContext must be used within PhotoContextProvider");
  }
  return context;
}

