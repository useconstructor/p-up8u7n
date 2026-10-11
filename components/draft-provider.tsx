"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { Draft, Product } from "@/lib/types";
type Status = "loading" | "saving" | "saved" | "error";
type ContextValue = {
  products: Product[];
  draft: Draft | null;
  status: Status;
  error: string;
  loading: boolean;
  update: (patch: Partial<Draft>, immediate?: boolean) => void;
  flush: () => Promise<boolean>;
  navigate: (href: string) => Promise<void>;
  retry: () => void;
  reload: () => void;
};
const Context = createContext<ContextValue | null>(null);
const token = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
export function DraftProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const current = useRef<Draft | null>(null);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flight = useRef<Promise<boolean> | null>(null);
  const revision = useRef(0);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [pr, dr] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/draft", { cache: "no-store" }),
      ]);
      const [p, d] = await Promise.all([pr.json(), dr.json()]);
      if (!pr.ok || !dr.ok) throw Error(p.error || d.error);
      setProducts(p);
      current.current = d;
      setDraft(d);
      dirty.current = false;
      setStatus("saved");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo cargar el catálogo.",
      );
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);
  const flush = useCallback(async (): Promise<boolean> => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (flight.current) return await flight.current;
    if (!dirty.current) return true;
    const work = (async () => {
      while (dirty.current && current.current) {
        const snapshot = { ...current.current };
        const rev = revision.current;
        setStatus("saving");
        setError("");
        try {
          let response = await fetch("/api/draft", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(snapshot),
          });
          let saved = await response.json();
          // Recover a committed PATCH whose response was lost, without replacing newer local edits.
          if (response.status === 409) {
            const recoveredResponse = await fetch("/api/draft", {
              cache: "no-store",
            });
            const recovered = await recoveredResponse.json();
            const equal = (d: Draft) =>
              JSON.stringify({
                name: d.name,
                email: d.email,
                notes: d.notes,
                idempotencyKey: d.idempotencyKey,
                items: [...d.items].sort((a, b) =>
                  a.productId.localeCompare(b.productId),
                ),
              });
            if (recoveredResponse.ok && equal(recovered) === equal(snapshot)) {
              saved = recovered;
              response = recoveredResponse;
            }
          }
          if (!response.ok) throw Error(saved.error || "No se pudo guardar.");
          current.current = { ...current.current!, version: saved.version };
          setDraft({ ...current.current });
          dirty.current = revision.current !== rev;
        } catch (e) {
          setStatus("error");
          setError(
            e instanceof Error
              ? e.message
              : "No se pudo guardar. Tus cambios siguen aquí.",
          );
          return false;
        }
      }
      setStatus("saved");
      return true;
    })();
    flight.current = work;
    const result = await work;
    flight.current = null;
    return result;
  }, []);
  const update = useCallback(
    (patch: Partial<Draft>, immediate = false) => {
      if (!current.current) return;
      current.current = {
        ...current.current,
        ...patch,
        idempotencyKey: token(),
      };
      revision.current++;
      dirty.current = true;
      setDraft({ ...current.current });
      setStatus("saving");
      setError("");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), immediate ? 0 : 500);
    },
    [flush],
  );
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const navigate = async (href: string) => {
    if (await flush()) {
      router.push(href);
      if (href.includes("#"))
        setTimeout(() => document.getElementById("catalogo")?.focus(), 100);
    }
  };
  return (
    <Context.Provider
      value={{
        products,
        draft,
        status,
        error,
        loading,
        update,
        flush,
        navigate,
        retry: () => {
          void (current.current ? flush() : load());
        },
        reload: () => {
          void load();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDraft() {
  const c = useContext(Context);
  if (!c) throw Error("DraftProvider required");
  return c;
}
