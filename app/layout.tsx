import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AS Trading Journal V4",
  description: "A modern trading journal application that helps you log, track, and analyze your trades. It leverages AI to provide insights into your trading habits and decision-making process.",
};

export default function RootLayout({
  children,
}: Readonly<{
  // FIX: Added React import to resolve namespace issue for React.ReactNode.
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-brand-text font-sans">
        {children}
      </body>
    </html>
  );
}