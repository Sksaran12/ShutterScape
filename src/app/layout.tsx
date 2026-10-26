import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

// Google Fonts are loaded via CSS in globals.css (with @import)
// so that the Next.js build does not try to fetch them at compile time
// (which fails in offline/sandbox environments).

export const metadata: Metadata = {
  title: "ShutterScape — Official Photography Club | Girijananda Choudhury University",
  description:
    "Official photography club website for Girijananda Choudhury University. Discover student visual stories, photography exhibitions, upcoming campus photowalks, and creative workshops.",
  keywords: [
    "ShutterScape",
    "GCU Photography Club",
    "Girijananda Choudhury University",
    "Photography Club Guwahati",
    "Student Photography",
    "Visual Storytelling",
  ],
  authors: [{ name: "Codénix (GCU Coding Club)" }],
  icons: {
    icon: "/assets/club/logo_1.jpeg",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090C",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-background text-text-primary min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
