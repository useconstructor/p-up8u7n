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
          <footer className="mx-auto flex max-w-[1328px] flex-wrap items-center justify-between gap-1 border-t border-obrador/15 px-5 py-4 text-sm md:gap-2 md:px-10 md:py-5 lg:px-12">
            <span className="font-heading text-xl font-semibold tracking-tight">
              Miga. El pan, en primer plano.
            </span>
            <span className="text-tinta/65">Corteza, miga y un trozo más.</span>
          </footer>
        </DraftProvider>
      </body>
    </html>
  );
}
