"use client";
import { useState } from "react";
import { Minus, Plus, Check, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useDraft } from "./draft-provider";
import type { Product } from "@/lib/types";
export function OrderControls({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const { draft, update } = useDraft();
  const item = draft?.items.find((i) => i.productId === product.id);
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState("");

  const quantity = (n: number) => {
    if (!Number.isInteger(n) || n < 1 || n > 20) {
      setError("Usa un número entero de 1 a 20.");
      return;
    }
    setError("");
    setValue(null);
    update(
      {
        items: draft!.items.map((i) =>
          i.productId === product.id ? { ...i, quantity: n } : i,
        ),
      },
      true,
    );
  };
  return (
    <div className="space-y-2">
      {!item ? (
        <Button
          id={`add-${product.id}`}
          disabled={!draft}
          onClick={() => {
            setValue(null);
            update(
              {
                items: [
                  ...draft!.items,
                  { productId: product.id, quantity: 1 },
                ],
              },
              true,
            );
            requestAnimationFrame(() => document.getElementById('quantity-' + product.id)?.focus({ preventScroll: true }));
          }}
          className="h-11 rounded-lg px-5 text-base font-semibold"
        >
          <Plus size={18} />
          Añadir al pedido
        </Button>
      ) : (
        <>
          <div
            className={`flex flex-wrap items-center gap-3 ${compact ? "" : "sm:gap-4"}`}
          >
            <div className="flex rounded-lg border border-obrador/30 bg-white">
              <button
                aria-label={`Reducir unidades de ${product.name}`}
                disabled={item.quantity <= 1}
                onClick={() => quantity(item.quantity - 1)}
                className="flex h-11 w-11 items-center justify-center text-obrador transition-colors hover:bg-agua disabled:opacity-35"
              >
                <Minus size={17} />
              </button>
              <label className="sr-only" htmlFor={`quantity-${product.id}`}>
                Unidades de {product.name}
              </label>
              <input
                id={`quantity-${product.id}`}
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                step={1}
                value={value ?? String(item?.quantity || 1)}
                aria-invalid={!!error}
                aria-describedby={
                  error ? `quantity-error-${product.id}` : undefined
                }
                onChange={(e) => {
                  setValue(e.target.value);
                  const n = Number(e.target.value);
                  if (
                    e.target.value &&
                    Number.isInteger(n) &&
                    n >= 1 &&
                    n <= 20
                  )
                    quantity(n);
                  else setError("Usa un número entero de 1 a 20.");
                }}
                onBlur={() => {
                  if (error) {
                    setValue(String(item.quantity));
                    setError("");
                  }
                }}
                className="h-11 w-12 border-x border-obrador/20 bg-transparent text-center text-base [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                aria-label={`Aumentar unidades de ${product.name}`}
                disabled={item.quantity >= 20}
                onClick={() => quantity(item.quantity + 1)}
                className="flex h-11 w-11 items-center justify-center text-obrador transition-colors hover:bg-agua disabled:opacity-35"
              >
                <Plus size={17} />
              </button>
            </div>
            {!compact && (
              <span className="flex items-center gap-1 text-sm text-obrador">
                <Check size={16} />
                En tu pedido
              </span>
            )}
            <button
              onClick={() => {
                setError("");
                update(
                  {
                    items: draft!.items.filter(
                      (i) => i.productId !== product.id,
                    ),
                  },
                  true,
                );
                requestAnimationFrame(() => document.getElementById('add-' + product.id)?.focus({ preventScroll: true }));
              }}
              aria-label={`Quitar ${product.name} del pedido`}
              className="flex min-h-11 items-center gap-1 text-sm underline decoration-tinta/30 underline-offset-4 hover:text-error"
            >
              {compact && <Trash2 size={14} />}Quitar del pedido
            </button>
          </div>
          {error && (
            <p
              id={`quantity-error-${product.id}`}
              role="alert"
              className="text-sm text-error"
            >
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
