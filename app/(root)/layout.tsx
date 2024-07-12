import type { Metadata } from "next";
import "../globals.css";


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
      <body className="bg-[#01020C]">
        {children}
      </body>
    </html>
  );
}
