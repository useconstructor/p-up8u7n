"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useDraft } from "./draft-provider";
import { SaveStatus } from "./summary";
import { OrderControls } from "./order-controls";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
export function OrderPage() {
  const { products, draft, loading, navigate, update, flush, error, reload } =
    useDraft();
  const router = useRouter();
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);
  const guard = useRef(false);
  const count = draft?.items.reduce((n, i) => n + i.quantity, 0) || 0;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guard.current || !draft) return;
    const errors: Record<string, string> = {};
    if (!draft.name.trim()) errors.name = "Escribe un nombre ficticio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()))
      errors.email = "Escribe un correo con formato válido.";
    setFields(errors);
    setSubmitError("");
    if (Object.keys(errors).length) {
      document.getElementById(Object.keys(errors)[0])?.focus();
      return;
    }
    guard.current = true;
    setSending(true);
    try {
      if (!(await flush()))
        throw Error(
          "El borrador aún no está guardado. Reintenta el guardado antes de enviar.",
        );
      const latest = await fetch("/api/draft", { cache: "no-store" });
      const saved = await latest.json();
      if (!latest.ok) throw Error(saved.error);
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saved),
      });
      const result = await r.json();
      if (!r.ok) {
        if (result.fields) setFields(result.fields);
        throw Error(result.error);
      }
      router.push("/confirmacion/" + result.token);
    } catch (e) {
      setSubmitError(
        e instanceof Error
          ? e.message
          : "No se pudo confirmar el guardado. Reintenta con el mismo pedido.",
      );
    } finally {
      guard.current = false;
      setSending(false);
    }
  };
  return (
    <main className="mx-auto max-w-[1328px] px-5 pt-6 pb-12 md:px-12 md:pt-8">
      <Link
        href="/#catalogo"
        onClick={(e) => {
          e.preventDefault();
          void navigate("/#catalogo");
        }}
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-obrador"
      >
        <ArrowLeft size={17} />
        Volver a los panes
      </Link>
      <p className="mb-1 text-sm text-obrador">Pedido de demostración</p>
      <h1 className="text-[32px] leading-tight md:text-5xl">
        Un poco de esto,
        <br className="hidden sm:block" /> un poco de pan.
      </h1>
      <p className="mt-4 mb-8 max-w-xl text-lg">
        Revisa tu selección y guarda tu pedido de ejemplo.
      </p>
      {loading ? (
        <div className="h-96 animate-pulse rounded-lg bg-agua" />
      ) : !draft ? (
        <div className="rounded-lg bg-agua p-8">
          <p>{error}</p>
          <Button onClick={reload} className="mt-4 h-11">
            Volver a intentar
          </Button>
        </div>
      ) : !count ? (
        <section className="max-w-2xl rounded-lg border bg-agua p-8 md:p-12">
          <ShoppingBag
            size={36}
            strokeWidth={1.3}
            className="mb-5 text-obrador"
          />
          <h2 className="text-[26px] md:text-4xl">Tu pedido está vacío</h2>
          <p className="mt-3 mb-6 text-lg">
            Todo empieza con un pan. Vuelve al catálogo y elige el primero.
          </p>
          <Button
            onClick={() => void navigate("/#catalogo")}
            className="h-12 text-base"
          >
            Elegir panes
            <ArrowRight size={18} />
          </Button>
        </section>
      ) : (
        <div className="grid items-start gap-8 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr]">
          <section aria-labelledby="selection-heading">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="selection-heading" className="text-[26px] md:text-[28px]">
                Los panes que has elegido
              </h2>
              <span className="text-sm">{count} unidades</span>
            </div>
            <div className="divide-y overflow-hidden rounded-lg border bg-white">
              {draft.items.map((item) => {
                const p = products.find((p) => p.id === item.productId);
                return p ? (
                  <article key={p.id} className="p-5">
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        src={p.image}
                        alt={p.name}
                        width={100}
                        height={88}
                        sizes="100px"
                        className="h-[88px] w-[100px] rounded object-cover"
                      />
                      <h3 className="text-[22px] leading-tight">{p.name}</h3>
                    </div>
                    <fieldset
                      disabled={sending}
                      className="disabled:opacity-60"
                    >
                      <OrderControls product={p} compact />
                    </fieldset>
                  </article>
                ) : null;
              })}
            </div>
            <div className="mt-4">
              <SaveStatus />
            </div>
          </section>
          <section className="rounded-lg border border-obrador/15 bg-agua p-5 md:p-6 lg:p-8">
            <h2 className="text-[26px] md:text-[28px]">Tus datos de ejemplo</h2>
            <p className="mt-2 mb-6 text-base">
              Usa datos ficticios. No se enviarán correos ni se preparará el
              pedido.
            </p>
            <form onSubmit={submit} noValidate className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block font-semibold">
                  Nombre <span className="font-normal">(obligatorio)</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="off"
                  maxLength={120}
                  value={draft.name}
                  disabled={sending}
                  onChange={(e) => {
                    update({ name: e.target.value });
                    setFields((f) => ({ ...f, name: "" }));
                  }}
                  aria-invalid={!!fields.name}
                  aria-describedby={fields.name ? "name-error" : undefined}
                  className="h-12 bg-white text-base"
                />
                {fields.name && (
                  <p id="name-error" className="mt-2 text-sm text-error">
                    {fields.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block font-semibold">
                  Correo <span className="font-normal">(obligatorio)</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  maxLength={254}
                  value={draft.email}
                  disabled={sending}
                  onChange={(e) => {
                    update({ email: e.target.value });
                    setFields((f) => ({ ...f, email: "" }));
                  }}
                  aria-invalid={!!fields.email}
                  aria-describedby={fields.email ? "email-error" : "email-hint"}
                  className="h-12 bg-white text-base"
                />
                {fields.email ? (
                  <p id="email-error" className="mt-2 text-sm text-error">
                    {fields.email}
                  </p>
                ) : (
                  <p id="email-hint" className="mt-2 text-sm">
                    Puedes usar un correo ficticio como pan@example.com.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="notes" className="mb-2 block font-semibold">
                  Observaciones <span className="font-normal">(opcional)</span>
                </label>
                <Textarea
                  id="notes"
                  name="notes"
                  maxLength={2000}
                  value={draft.notes}
                  disabled={sending}
                  onChange={(e) => update({ notes: e.target.value })}
                  aria-describedby="notes-hint"
                  className="min-h-28 resize-y bg-white text-base"
                />
                <p id="notes-hint" className="mt-1 text-sm">
                  Hasta 2000 caracteres. Evita datos personales reales.
                </p>
              </div>
              <div className="border-t border-obrador/20 pt-5">
                <h3 className="mb-3 text-[22px]">Así se guardará tu pedido</h3>
                <ul className="space-y-2">
                  {draft.items.map((i) => (
                    <li
                      key={i.productId}
                      className="flex justify-between gap-3"
                    >
                      <span>
                        {products.find((p) => p.id === i.productId)?.name}
                      </span>
                      <strong className="shrink-0 text-obrador">
                        × {i.quantity}
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>
              <SaveStatus />
              {submitError && (
                <p role="alert" className="text-base text-error">
                  {submitError} Tus datos se conservan.
                </p>
              )}
              <Button
                type="submit"
                disabled={sending}
                className="h-auto min-h-12 w-full whitespace-normal px-3 py-3 text-base font-semibold"
              >
                {sending ? (
                  <>
                    <Loader2 size={18} className="shrink-0 animate-spin" />
                    Guardando pedido…
                  </>
                ) : (
                  <>
                    Guardar pedido de demostración
                    <ArrowRight size={17} className="shrink-0" />
                  </>
                )}
              </Button>
              <p className="flex items-start gap-2 text-sm">
                <Check size={16} className="mt-0.5 shrink-0 text-obrador" />
                Se guardará un ejemplo, sin pagos ni entrega.
              </p>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
