import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AS Trading Journal V1",
  description: "A modern trading journal application that helps you log, track, and analyze your trades. It leverages AI to provide insights into your trading habits and decision-making process.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-brand-bg">
        <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[linear-gradient(45deg,#0a0f1e,#1e3a8a,#3b82f6,#1e3a8a,#0a0f1e)] bg-[size:400%_400%] animate-background-pan"></div>
        {children}
      </body>
    </html>
  );
}
