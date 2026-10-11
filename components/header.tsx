"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ShoppingBag, Wheat } from "lucide-react";
import { useDraft } from "./draft-provider";
export function Header() {
  const { draft, navigate } = useDraft();
  const path = usePathname();
  const count = draft?.items.reduce((n, i) => n + i.quantity, 0) || 0;
  return (
    <header className="sticky top-0 z-40 border-b bg-harina/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1328px] items-center justify-between px-5 md:px-12">
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            void navigate("/");
          }}
          aria-label="Miga, ir al catálogo"
          className="flex items-center gap-2 text-obrador"
        >
          <Wheat size={29} strokeWidth={1.4} />
          <span className="font-heading text-[38px] font-bold leading-none tracking-[-.07em]">
            miga<span className="text-corteza">.</span>
          </span>
          <span className="ml-4 hidden border-l border-obrador/25 pl-4 text-sm text-tinta sm:block">
            Panadería
            <br />
            de ejemplo
          </span>
        </Link>
        <nav
          aria-label="Navegación principal"
          className="flex items-center gap-5 md:gap-8"
        >
          <Link
            href="/#catalogo"
            onClick={(e) => {
              e.preventDefault();
              void navigate("/#catalogo");
            }}
            className={`flex min-h-11 items-center text-base ${path === "/" ? "text-obrador underline decoration-2 underline-offset-8" : ""}`}
          >
            Panes
          </Link>
          <Link
            href="/pedido"
            onClick={(e) => {
              e.preventDefault();
              void navigate("/pedido");
            }}
            className={`flex min-h-11 items-center gap-2 text-base ${path === "/pedido" ? "text-obrador" : ""}`}
          >
            <ShoppingBag size={18} />
            <span>Pedido</span>
            <span
              className="flex h-6 min-w-6 items-center justify-center rounded-full bg-agua px-1 text-sm text-obrador"
              aria-label={`${count} unidades`}
            >
              {count}
            </span>
            <ArrowUpRight size={16} className="hidden sm:block" />
          </Link>
        </nav>
      </div>
      <div className="border-t border-obrador/10 bg-agua/70 px-4 py-2 text-center text-[12px] leading-4 sm:text-sm">
        Negocio ficticio. Los pedidos son de demostración y no se preparan ni
        entregan.
      </div>
    </header>
  );
}
