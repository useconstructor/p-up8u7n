"use client";
import { ArrowRight, Check, Loader2, RotateCw, ShoppingBag } from "lucide-react";
import { useDraft } from "./draft-provider";
import { Button } from "./ui/button";
export function SaveStatus() {
  const { status, error, retry } = useDraft();
  return (
    <div className="text-sm" role="status" aria-live="polite">
      {status === "saving" ? <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" />Guardando borrador…</span>
      : status === "saved" ? <span className="flex items-center gap-1.5 text-obrador"><Check size={14} />Borrador guardado</span>
      : status === "error" ? <div className="space-y-1 text-error"><p>{error}</p><button onClick={retry} className="flex min-h-11 items-center gap-2 underline"><RotateCw size={14} />Reintentar guardado</button></div>
      : <span>Cargando borrador…</span>}
    </div>
  );
}
export function Summary() {
  const { products, draft, navigate, loading } = useDraft();
  const count = draft?.items.reduce((n,i)=>n+i.quantity,0) || 0;
  return (
    <aside aria-labelledby="summary-heading" className="order-summary self-start border-t-2 border-obrador bg-white p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between"><h2 id="summary-heading" className="text-[26px]">Tu pedido</h2><ShoppingBag size={22} className="text-obrador" strokeWidth={1.5}/></div>
      {loading ? <div className="h-12 animate-pulse bg-agua" /> : count ? (
        <div className="space-y-3">{draft!.items.map(i=><div key={i.productId} className="flex justify-between gap-3"><span>{products.find(p=>p.id===i.productId)?.name}</span><strong className="shrink-0 text-obrador">× {i.quantity}</strong></div>)}<div className="flex justify-between border-t pt-3"><span>Total de unidades</span><strong>{count}</strong></div></div>
      ) : <p className="text-base leading-relaxed text-tinta/80">Elige tu primer pan. Aquí reuniremos tu selección.</p>}
      <Button disabled={loading || !draft} onClick={()=>void navigate(count ? "/pedido" : "/#catalogo")} className="mt-5 h-12 w-full text-base">{count ? "Revisar pedido" : "Elegir panes"}<ArrowRight size={18}/></Button>
      <div className="mt-3"><SaveStatus /></div>
    </aside>
  );
}
