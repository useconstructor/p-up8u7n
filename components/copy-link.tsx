"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "./ui/button";
export function CopyLink() {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div>
      <Button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setFailed(false);
          } catch {
            setFailed(true);
          }
        }}
        className="h-12 text-base"
        variant="outline"
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}Copiar enlace privado
      </Button>
      <p className="mt-2 text-sm" role="status">
        {copied
          ? "Enlace copiado."
          : failed
            ? "No se pudo copiar. Copia la dirección de esta página desde tu navegador."
            : "Quien tenga este enlace podrá consultar el pedido."}
      </p>
    </div>
  );
}
