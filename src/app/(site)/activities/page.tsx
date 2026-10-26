import type { Metadata } from "next";
import ActivitiesPage from "@/features/activities/ActivitiesPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Activities — ShutterScape",
  description:
    "Exhibitions, photography sessions, photowalks and campus challenges organised by the ShutterScape club at Girijananda Choudhury University.",
};

export default ActivitiesPage;
