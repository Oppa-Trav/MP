import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Student Manager",
  description: "Student Management Web App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}