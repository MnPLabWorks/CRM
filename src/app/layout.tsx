import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechnoImaging CRM",
  description: "A comprehensive Client Relationship Management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
