import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Framely — Your Moments, Printed",
  description: "Create beautiful photo poster collages, shipped to your door.",
  openGraph: {
    title: "Framely",
    description: "Your Moments, Printed.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-off-white text-charcoal font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
