import type { Metadata } from "next";

import "../globals.css";
import { Nav } from "@/components/shared/reusables";


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
      <body className="bg-[#01020C] text-white px-[6rem] py-[4rem]">
        <Nav />
        <main className="mt-[4rem]">
          {children}
        </main>
      </body>
    </html>
  );
}
