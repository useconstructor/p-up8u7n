"use client";
import {
  ArrowRight,
  Check,
  Loader2,
  RotateCw,
  ShoppingBag,
} from "lucide-react";
import { useDraft } from "./draft-provider";
import { Button } from "./ui/button";
export function SaveStatus() {
  const { status, error, retry } = useDraft();
  return (
    <div className="text-sm" role="status" aria-live="polite">
      {status === "saving" ? (
        <span className="flex items-center gap-1.5">
          <Loader2 size={14} className="animate-spin" />
          Guardando…
        </span>
      ) : status === "saved" ? (
        <span className="flex items-center gap-1.5 text-obrador">
          <Check size={14} />
          Guardado
        </span>
      ) : status === "error" ? (
        <div className="space-y-1 text-error">
          <p>{error}</p>
          <button
            onClick={retry}
            className="flex min-h-11 items-center gap-2 underline"
          >
            <RotateCw size={14} />
            Reintentar guardado
          </button>
        </div>
      ) : (
        <span>Cargando borrador…</span>
      )}
    </div>
  );
}
export function Summary() {
  const { products, draft, navigate, loading } = useDraft();
  const count = draft?.items.reduce((n, i) => n + i.quantity, 0) || 0;
  return (
    <>
      <aside className="hidden self-start overflow-hidden rounded-lg border border-obrador/15 bg-agua md:block">
        <div className="flex items-center justify-between border-b border-obrador/15 px-6 py-5">
          <h2 className="text-[26px]">Tu pedido</h2>
          <ShoppingBag className="text-obrador" size={22} strokeWidth={1.5} />
        </div>
        <div className="px-6 py-6">
          {loading ? (
            <div className="h-32 animate-pulse rounded bg-harina" />
          ) : count ? (
            <div className="space-y-4">
              {draft!.items.map((i) => (
                <div
                  key={i.productId}
                  className="flex justify-between gap-3 text-base"
                >
                  <span>
                    {products.find((p) => p.id === i.productId)?.name}
                  </span>
                  <span className="whitespace-nowrap font-semibold text-obrador">
                    × {i.quantity}
                  </span>
                </div>
              ))}
              <div className="flex justify-between border-t border-obrador/15 pt-4">
                <span>Total de unidades</span>
                <strong>{count}</strong>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <p className="font-heading text-xl font-medium">
                Aquí empieza tu pedido.
              </p>
              <p className="mt-2 text-base leading-relaxed">
                Elige los panes que te apetezca probar y los reuniremos aquí.
              </p>
            </div>
          )}
          <Button
            disabled={loading}
            onClick={() => void navigate(count ? "/pedido" : "/#catalogo")}
            className="mt-6 h-12 w-full text-base"
          >
            {count ? "Revisar pedido" : "Elegir panes"}
            <ArrowRight size={18} />
          </Button>
          <div className="mt-4">
            <SaveStatus />
          </div>
        </div>
        <p className="border-t border-obrador/15 px-6 py-4 text-sm">
          Solo una demostración. Sin pagos.
        </p>
      </aside>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-obrador/20 bg-harina/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="min-w-0 text-sm">
            <span className="block font-semibold">
              {count
                ? `${count} ${count === 1 ? "unidad" : "unidades"} en tu pedido`
                : "Tu pedido está vacío"}
            </span>
            <span className="block text-xs">
              {loading
                ? "Cargando…"
                : draft
                  ? "Selección de demostración"
                  : "No se pudo cargar"}
            </span>
          </div>
          <Button
            disabled={loading}
            className="h-11 px-4 text-base"
            onClick={() => void navigate(count ? "/pedido" : "/#catalogo")}
          >
            {count ? "Revisar pedido" : "Elegir panes"}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </>
  );
}
