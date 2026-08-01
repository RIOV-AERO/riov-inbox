import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#F7F6F3",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://inbox.riov.com.br"),
  title: {
    default: "RIOV · Inbox",
    template: "%s · RIOV Inbox",
  },
  description: "Caixa de entrada centralizada da RIOV.",
  applicationName: "RIOV Inbox",
  authors: [{ name: "RIOV" }],
  generator: "Next.js",
  keywords: ["RIOV", "inbox", "email", "caixa de entrada", "gestão de e-mails"],
  icons: {
    icon: [{ url: "/logo.png", sizes: "any", type: "image/png" }],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "RIOV · Inbox",
    description: "Caixa de entrada centralizada da RIOV.",
    url: "https://inbox.riov.com.br",
    siteName: "RIOV Inbox",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RIOV · Inbox",
    description: "Caixa de entrada centralizada da RIOV.",
  },
  robots: {
    index: false,
    follow: false,
  },
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
