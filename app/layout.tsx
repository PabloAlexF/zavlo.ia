import type { Metadata } from "next";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zavlo.ia - Encontre o melhor preço com IA",
  description: "Busque produtos em todos os marketplaces brasileiros usando Inteligência Artificial. Compare preços e economize!",
  keywords: "marketplace, comparação de preços, IA, busca inteligente, OLX, Mercado Livre",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-[#0B0B0F] text-white antialiased selection:bg-purple-500/30 selection:text-purple-200" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
