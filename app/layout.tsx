import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Framely — Anılarınız, Baskıda",
  description: "Harika fotoğraflı poster kolajları oluşturun, kapınıza gelsin.",
  openGraph: {
    title: "Framely",
    description: "Anılarınız, Baskıda.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-off-white text-charcoal font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
