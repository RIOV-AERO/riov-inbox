import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RIOV · Inbox",
  description: "Caixa de entrada centralizada da RIOV.",
  metadataBase: new URL("https://inbox.riov.com.br"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-page font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
