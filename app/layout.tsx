import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riov · Inbox",
  description: "Caixa de entrada.",
  metadataBase: new URL("https://inbox.riov.com.br"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased font-mono">{children}</body>
    </html>
  );
}
