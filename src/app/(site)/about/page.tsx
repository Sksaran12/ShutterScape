import type { Metadata } from "next";
import AboutPage from "@/features/about/AboutPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — ShutterScape",
  description:
    "Meet the faculty coordinators, leadership, core members and alumni of ShutterScape, the photography club of Girijananda Choudhury University.",
};

export default AboutPage;
