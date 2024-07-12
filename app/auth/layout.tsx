import type { Metadata } from "next";

import "./../globals.css";
import { Card } from "@/components/shared/Reusables";


export const metadata: Metadata = {
  title: "Sumffy.ai | Auth",
  description: "Personalized AI Activity Suggestion App. Brainstorm | Ideate | Create!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#01020C] text-white">
        <main className="h-screen flex items-center justify-center">
          <Card>{children}</Card>
        </main>
      </body>
    </html>
  );
}
