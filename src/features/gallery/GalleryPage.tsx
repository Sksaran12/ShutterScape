import { getGallery } from "@/lib/content";
import GalleryClient from "./GalleryClient";

export default async function GalleryPage() {
  const { items } = await getGallery();
  return <GalleryClient items={items} />;
}
