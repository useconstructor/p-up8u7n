import type { Metadata } from "next";
import localFont from "next/font/local";
import { DraftProvider } from "@/components/draft-provider";
import { Header } from "@/components/header";
import "./globals.css";
const title = localFont({
  src: "../public/fonts/bricolagegrotesque.ttf",
  variable: "--font-title",
  display: "swap",
  weight: "200 800",
});
const body = localFont({
  src: "../public/fonts/sourcesans3.ttf",
  variable: "--font-body",
  display: "swap",
  weight: "200 900",
});
export const metadata: Metadata = {
  title: { default: "Panes de Miga · Panadería Miga", template: "%s · Miga" },
  description:
    "Descubre el catálogo de ejemplo de Miga y compón un pedido de demostración.",
  referrer: "no-referrer",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${title.variable} ${body.variable}`}>
        <DraftProvider>
          <Header />
          {children}
          <footer className="mx-auto flex max-w-[1328px] flex-wrap items-center justify-between gap-4 border-t px-6 pt-8 pb-28 text-sm md:px-12 md:pb-8">
            <span className="font-heading text-xl font-semibold tracking-tight">
              Miga. El pan, en primer plano.
            </span>
            <span>Un catálogo para explorar. Un pedido para probar.</span>
          </footer>
        </DraftProvider>
      </body>
    </html>
  );
}
