import type { Metadata } from "next";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { ReactNode } from "react";
import { Sora } from 'next/font/google';
import "./globals.css";

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Zavlo.ia - Encontre o melhor preço com IA",
  description: "Busque produtos em todos os marketplaces brasileiros usando Inteligência Artificial. Compare preços e economize!",
  keywords: "marketplace, comparação de preços, IA, busca inteligente, OLX, Mercado Livre",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    interactiveWidget: 'resizes-content'
  },
  themeColor: '#12110D',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Zavlo.ia'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={sora.className} suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-[#050409] text-white antialiased selection:bg-blue-500/30 selection:text-blue-200" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}