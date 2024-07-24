import type { Metadata } from "next";

import "../globals.css";
import { MobileNav, Nav } from "@/components/shared/reusables";


export const metadata: Metadata = {
  title: "Sumffy.ai",
  description: "Personalized AI Activity Suggestion App. Brainstorm | Ideate | Create!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#01020C] text-white px-[1rem] py-[1rem] sm:py-[4rem] sm:px-[6rem]">
        <Nav />
        <MobileNav />
        <main className="mt-[4rem]">
          {children}
        </main>
      </body>
    </html>
  );
}
