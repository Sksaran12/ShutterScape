import type { Metadata } from "next";
import GalleryPage from "@/features/gallery/GalleryPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery — ShutterScape",
  description:
    "Photographs by ShutterScape members: exhibitions, workshops, photowalks and behind-the-lens stories from Girijananda Choudhury University.",
};

export default GalleryPage;
