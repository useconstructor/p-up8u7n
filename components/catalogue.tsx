"use client";
import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useDraft } from "./draft-provider";
import { OrderControls } from "./order-controls";
import { Summary } from "./summary";
export function Catalogue() {
  const { products, loading, error, reload } = useDraft();
  const first = products[0];
  const choose = () => {
    const section = document.getElementById("catalogo");
    section?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    section?.focus({ preventScroll: true });
  };
  return (
    <main className="catalogue-page mx-auto max-w-[1328px] px-5 pt-6 pb-6 md:px-10 md:pt-9 lg:px-12">
      <div className="catalogue-intro mb-6 flex items-end justify-between gap-6 border-b border-obrador/25 pb-5 md:mb-8 md:pb-7">
        <div>
          <h1 className="text-[36px] leading-[1.05] text-obrador md:text-[58px] lg:text-[72px]">El pan, en primer plano.</h1>
          <p className="mt-3 text-base text-tinta/80 md:text-lg">Tres panes. Tu combinación.</p>
        </div>
        <button onClick={choose} className="hidden min-h-11 shrink-0 items-center gap-3 text-obrador md:flex">Ver los panes <ArrowDown size={18} /></button>
      </div>
      <div className="grid items-start gap-6 min-[1100px]:grid-cols-[minmax(0,1fr)_288px] min-[1100px]:gap-8">
        <section id="catalogo" tabIndex={-1} aria-label="Selector de panes" className="min-w-0 scroll-mt-32 focus-visible:outline-2 focus-visible:outline-offset-4">
          {loading ? (
            <div className="space-y-6" aria-label="Cargando catálogo">{[0,1,2].map(i => <div key={i} className="h-[300px] animate-pulse bg-agua" />)}</div>
          ) : !first ? (
            <div className="bg-agua p-8"><h2 className="text-[26px]">El catálogo no se pudo cargar</h2><p className="my-4">{error}</p><button onClick={reload} className="min-h-11 rounded-lg bg-obrador px-5 text-white">Volver a intentar</button></div>
          ) : (
            <>
              <article className="featured-bread">
                <div className="featured-photo photo-entry relative overflow-hidden bg-agua">
                  <Image src={first.image} alt="Hogaza de masa madre con corteza dorada sobre una tabla de madera" fill sizes="(max-width: 767px) 100vw, (max-width: 1099px) 90vw, 848px" priority className="object-cover object-[center_52%]" />
                </div>
                <div className="featured-copy relative bg-agua px-5 py-5 md:px-7 md:py-6">
                  <span aria-hidden="true" className="bread-number">01</span>
                  <h2 className="pr-8 text-[27px] leading-tight md:text-[36px]">{first.name}</h2>
                  <p className="mt-2 mb-4 max-w-[540px] text-base leading-relaxed md:text-lg">{first.description}</p>
                  <OrderControls product={first} />
                </div>
              </article>
              <div className="mt-7 md:mt-9">
                {products.slice(1).map((p, index) => (
                  <article key={p.id} className={`bread-row ${index === 1 ? "bread-row-reverse" : ""}`}>
                    <div className="bread-row-photo relative overflow-hidden bg-agua">
                      <Image src={p.image} alt={p.id === "baguette" ? "Baguette abierta mostrando la miga y su corteza fina" : "Pan de semillas sobre una tabla, con una rebanada"} fill sizes="(max-width: 599px) 100vw, (max-width: 1099px) 45vw, 400px" className={`object-cover ${p.id === "semillas" ? "object-[35%_center]" : "object-center"}`} />
                    </div>
                    <div className="bread-row-copy relative flex min-w-0 flex-col justify-center py-5 md:py-6">
                      <span aria-hidden="true" className="mb-3 font-heading text-sm text-obrador">0{index+2} <span className="ml-2 inline-block h-px w-8 bg-obrador/35 align-middle" /></span>
                      <h2 className="text-[28px] leading-tight md:text-[32px]">{p.name}</h2>
                      <p className="mt-3 mb-5 text-base leading-relaxed">{p.description}</p>
                      <OrderControls product={p} />
                    </div>
                  </article>
                ))}
              </div>
              <p className="mt-4 text-sm text-tinta/75">De 1 a 20 unidades por pan. Combínalos a tu gusto.</p>
            </>
          )}
        </section>
        <Summary />
      </div>
      <details className="mt-6 border-t border-obrador/15 pt-2 text-sm text-tinta/75">
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 underline underline-offset-4">Fotografías y licencias <ArrowUpRight size={14} /></summary>
        <div className="space-y-2 py-2 leading-relaxed">
          {[
            ["Hogaza: Sarah Stierch (Missvain) · CC0", "https://commons.wikimedia.org/wiki/File:Sourdough_bread_-_January_2026_-_Sarah_Stierch_02.jpg"],
            ["Baguette: Popo le Chien · CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Baguette_mie.jpg"],
            ["Semillas: Jim Lukach · CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Seeded_bread_(14018953083).jpg"],
          ].map(([label,url]) => <a key={url} href={url} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-1 hover:text-obrador">{label}<ArrowUpRight size={14}/></a>)}
          <p>Imágenes recortadas y ajustadas en nitidez; pan de semillas con ajuste de luz y color.</p>
          <p className="flex flex-wrap gap-x-4"><a className="inline-flex min-h-11 items-center underline" href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a><a className="inline-flex min-h-11 items-center underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a><a className="inline-flex min-h-11 items-center underline" href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a></p>
        </div>
      </details>
    </main>
  );
}
