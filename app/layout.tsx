
import type { Metadata, Viewport } from "next";
import React from "react";
import "./globals.css";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "AS Trading Journal V4",
  description: "A modern trading journal application that helps you log, track, and analyze your trades. It leverages AI to provide insights into your trading habits and decision-making process.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AS Journal",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0a09",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-brand-text font-sans">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
