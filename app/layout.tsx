import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muse - Music Listening Tracker",
  description: "Track your music listening habits and discover insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

