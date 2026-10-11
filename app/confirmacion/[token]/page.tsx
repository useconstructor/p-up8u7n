import { getOrder } from "@/lib/store";
import { CopyLink } from "@/components/copy-link";
import { Check, ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Pedido guardado",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  let order;
  let failed = false;
  try {
    order = await getOrder((await params).token);
  } catch {
    failed = true;
  }
  return (
    <main className="mx-auto max-w-[900px] px-5 py-8 md:px-12 md:py-12">
      {!order ? (
        <section className="rounded-lg border bg-agua p-8">
          <h1 className="text-[32px] md:text-4xl">
            {failed
              ? "No se pudo consultar el pedido"
              : "No encontramos ese pedido"}
          </h1>
          <p className="mt-4 mb-6">
            {failed
              ? "Vuelve a cargar esta página para intentarlo de nuevo."
              : "Comprueba el enlace privado o vuelve al catálogo."}
          </p>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-obrador underline"
          >
            <ArrowLeft size={18} />
            Volver al catálogo
          </Link>
        </section>
      ) : (
        <>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-agua text-obrador">
            <Check size={30} strokeWidth={1.5} />
          </div>
          <p className="mb-2 text-sm text-obrador">
            Confirmación de demostración
          </p>
          <h1 className="text-[32px] leading-tight md:text-5xl">
            Tu pedido está guardado.
          </h1>
          <p className="mt-4 mb-8 text-lg">
            Un ejemplo de principio a fin. Puedes volver a consultarlo con tu
            enlace privado.
          </p>
          <section className="overflow-hidden rounded-lg border">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-agua px-6 py-5">
              <h2 className="text-[26px]">Resumen del pedido</h2>
              <time className="text-sm">
                {new Intl.DateTimeFormat("es", {
                  dateStyle: "long",
                  timeStyle: "short",
                  timeZone: "UTC",
                }).format(
                  new Date(order.createdAt.replace(" ", "T") + "Z"),
                )}{" "}
                UTC
              </time>
            </div>
            <div className="space-y-5 bg-white p-6">
              <ul className="divide-y">
                {order.items.map((i) => (
                  <li
                    key={i.name}
                    className="flex items-center justify-between gap-3 py-4"
                  >
                    <span className="font-heading text-[22px] font-medium">
                      {i.name}
                    </span>
                    <strong className="text-lg text-obrador">
                      × {i.quantity}
                    </strong>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t pt-4">
                <span>Total de unidades</span>
                <strong>
                  {order.items.reduce((n, i) => n + i.quantity, 0)}
                </strong>
              </div>
              <dl className="grid gap-4 border-t pt-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm">Nombre guardado</dt>
                  <dd className="mt-1 break-words font-semibold">
                    {order.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm">Correo guardado</dt>
                  <dd className="mt-1 break-all font-semibold">
                    {order.email}
                  </dd>
                </div>
                {order.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm">Observaciones</dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words">
                      {order.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </section>
          <section className="mt-6 rounded-lg bg-agua p-6">
            <h2 className="mb-3 flex items-center gap-2 text-[22px]">
              <LockKeyhole size={20} />
              Tu enlace privado
            </h2>
            <p className="mb-4 break-all text-sm">Referencia: {order.token}</p>
            <CopyLink />
          </section>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-obrador underline underline-offset-4"
          >
            <ArrowLeft size={18} />
            Volver al catálogo
          </Link>
        </>
      )}
    </main>
  );
}
