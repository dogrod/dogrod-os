import type { Metadata } from "next";
import { BlogHeader } from "./_components/BlogHeader";

export const metadata: Metadata = {
  title: "Blog | dogrodOS",
  description: "Stories, notes, and ideas from Brian",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <BlogHeader />
      <main className="pt-16">{children}</main>
    </div>
  );
}
