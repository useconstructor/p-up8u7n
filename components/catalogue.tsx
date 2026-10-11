"use client";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, Wheat } from "lucide-react";
import { useDraft } from "./draft-provider";
import { OrderControls } from "./order-controls";
import { SaveStatus, Summary } from "./summary";
export function Catalogue() {
  const { products, loading, error, reload } = useDraft();
  const first = products[0];
  const choose = () => {
    const section = document.getElementById("catalogo");
    section?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
    section?.focus({ preventScroll: true });
  };
  return (
    <main className="mx-auto max-w-[1328px] px-5 pt-6 pb-28 md:px-12 md:pt-8 md:pb-12">
      <div className="mb-6 flex items-end justify-between gap-5 md:mb-8">
        <div>
          <p className="mb-1 flex items-center gap-2 text-sm text-obrador">
            <span className="h-1.5 w-1.5 rounded-full bg-obrador" />
            Catálogo de ejemplo
          </p>
          <h1 className="text-[32px] leading-[1.1] md:text-5xl">
            Panes de Miga
          </h1>
        </div>
        <button
          onClick={choose}
          className="flex min-h-11 shrink-0 items-center gap-2 border-b border-obrador text-base text-obrador"
        >
          Elegir panes
          <ArrowDown size={17} />
        </button>
      </div>
      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <section
          id="catalogo"
          tabIndex={-1}
          aria-label="Selector de panes"
          className="min-w-0 scroll-mt-36 rounded-lg focus-visible:outline-2"
        >
          {loading ? (
            <div className="space-y-6" aria-label="Cargando catálogo">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[300px] animate-pulse rounded-lg bg-agua"
                />
              ))}
            </div>
          ) : !first ? (
            <div className="rounded-lg border bg-agua p-8">
              <h2 className="text-[26px]">El catálogo no se pudo cargar</h2>
              <p className="my-4">{error}</p>
              <button
                onClick={reload}
                className="min-h-11 rounded-lg bg-obrador px-5 text-white"
              >
                Volver a intentar
              </button>
            </div>
          ) : (
            <>
              <article className="overflow-hidden rounded-lg border border-obrador/20">
                <div className="relative h-[180px] overflow-hidden bg-agua md:h-[280px] lg:h-[320px]">
                  <Image
                    src={first.image}
                    alt="Hogaza de masa madre con corteza dorada sobre una tabla"
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 55vw, 800px"
                    priority
                    className="photo-entry object-cover object-[center_55%]"
                  />
                  <span className="absolute bottom-4 left-4 rounded bg-harina/95 px-3 py-1.5 text-sm text-tinta">
                    Masa madre
                  </span>
                </div>
                <div className="bg-agua px-5 py-5 md:px-6 md:py-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 className="max-w-[340px] text-[26px] leading-tight md:text-4xl">
                      {first.name}
                    </h2>
                    <Wheat
                      size={28}
                      strokeWidth={1.3}
                      className="mt-1 shrink-0 text-corteza"
                    />
                  </div>
                  <p className="mb-5 max-w-[470px] text-base leading-relaxed md:text-lg">
                    {first.description}
                  </p>
                  <OrderControls product={first} />
                </div>
              </article>
              <div className="mt-6 space-y-6">
                {products.slice(1).map((p, index) => (
                  <article
                    key={p.id}
                    className={`flex overflow-hidden rounded-lg border border-obrador/20 bg-white max-[540px]:flex-col md:flex-col lg:flex-row ${index === 1 ? "min-[1100px]:flex-row-reverse" : ""}`}
                  >
                    <div className="relative h-[180px] shrink-0 bg-agua min-[541px]:h-auto min-[541px]:w-[42%] md:h-[180px] md:w-full lg:h-auto lg:w-[38%] lg:min-h-[264px]">
                      <Image
                        src={p.image}
                        alt={
                          p.id === "baguette"
                            ? "Baguette abierta mostrando la miga y su corteza fina"
                            : "Pan de semillas dorado con semillas en su corteza"
                        }
                        fill
                        sizes="(max-width: 540px) 100vw, (max-width: 767px) 40vw, 300px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-6 md:px-6">
                      <p className="mb-2 text-sm text-corteza">
                        {p.id === "baguette"
                          ? "Corteza y miga"
                          : "Textura en cada corte"}
                      </p>
                      <h2 className="text-[26px] leading-tight md:text-[28px]">
                        {p.name}
                      </h2>
                      <p className="mt-3 mb-5 text-base leading-relaxed">
                        {p.description}
                      </p>
                      <OrderControls product={p} />
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-sm">
                <span>Elige entre 1 y 20 unidades por pan.</span>
                <SaveStatus />
              </div>
            </>
          )}
          <details className="mt-8 text-sm">
            <summary className="min-h-11 cursor-pointer text-tinta/80 underline underline-offset-4">
              Fotografías y licencias
            </summary>
            <div className="space-y-2 pb-4 leading-relaxed">
              {[
                [
                  "Hogaza: Agelaia · CC BY 4.0",
                  "https://commons.wikimedia.org/wiki/File:Sourdough_Bread_Loaf.jpg",
                ],
                [
                  "Baguette: Popo le Chien · CC BY SA 4.0",
                  "https://commons.wikimedia.org/wiki/File:Baguette_mie.jpg",
                ],
                [
                  "Semillas: Jim Lukach · CC BY 2.0",
                  "https://commons.wikimedia.org/wiki/File:Seeded_bread_(14018953083).jpg",
                ],
              ].map(([label, url]) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 items-center gap-1 hover:text-obrador"
                >
                  {label}
                  <ArrowUpRight size={14} />
                </a>
              ))}
              <p>Fotografías de ejemplo, recortadas para este catálogo.</p>
            </div>
          </details>
        </section>
        <div className="contents">
          <Summary />
        </div>
      </div>
      <div className="mt-10 flex items-center gap-4 text-obrador">
        <span className="h-px flex-1 bg-obrador/20" />
        <Wheat size={24} strokeWidth={1.3} />
        <span className="h-px flex-1 bg-obrador/20" />
      </div>
    </main>
  );
}
