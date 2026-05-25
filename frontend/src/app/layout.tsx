import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel View Vietnam",
  description:
    "Explore historic tourism statistics across Vietnam's provinces — tourists, hotels, landmarks, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0b0f1a" />
      </head>
      <body>{children}</body>
    </html>
  );
}
