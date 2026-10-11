import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { database } from "./db";
import type { Draft, SavedOrder } from "./types";
export const randomToken = () => randomBytes(32).toString("hex");
export const hash = (s: string) => createHash("sha256").update(s).digest("hex");
let initialized: Promise<void> | undefined;
export async function initialize() {
  initialized ??= (async () => {
    const db = database();
    await db.execute("PRAGMA foreign_keys = ON");
    const sql = await readFile(
      process.cwd() + "/migrations/001_initial.sql",
      "utf8",
    );
    const tx = await db.transaction("write");
    try {
      for (const statement of sql
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean))
        await tx.execute(statement);
      const marker = await tx.execute(
        "SELECT id FROM migrations WHERE id='001'",
      );
      if (!marker.rows.length) {
        for (const p of [
          [
            "hogaza",
            "Hogaza de masa madre",
            "Corteza dorada, miga abierta y un carácter propio. Un pan para cortar y compartir.",
            "/media/hogaza.webp",
            1,
          ],
          [
            "baguette",
            "Baguette",
            "Alargada, de corteza fina y miga ligera. Su forma invita a partir un trozo más.",
            "/media/baguette.webp",
            2,
          ],
          [
            "semillas",
            "Pan de semillas",
            "Una miga tierna con semillas y una corteza llena de textura. Cada corte, distinto.",
            "/media/semillas.webp",
            3,
          ],
        ])
          await tx.execute({
            sql: "INSERT INTO products (id,name,description,image,position) VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
            args: p,
          });
        await tx.execute("INSERT INTO migrations(id) VALUES ('001')");
      }
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    } finally {
      tx.close();
    }
  })().catch((e) => {
    initialized = undefined;
    throw e;
  });
  return initialized;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}
export function validateDraft(value: unknown): Draft {
  if (!value || typeof value !== "object")
    throw new ApiError(400, "El pedido no tiene un formato válido.");
  const d = value as Draft;
  const fields: Record<string, string> = {};
  for (const [key, max] of [
    ["name", 120],
    ["email", 254],
    ["notes", 2000],
  ] as const)
    if (typeof d[key] !== "string" || d[key].length > max)
      fields[key] = `Usa un máximo de ${max} caracteres.`;
  if (Object.keys(fields).length)
    throw new ApiError(400, "Revisa los campos.", fields);
  if (
    !Array.isArray(d.items) ||
    d.items.length > 3 ||
    d.items.some((i) => !i || typeof i !== "object") ||
    new Set(d.items.map((i) => i.productId)).size !== d.items.length ||
    d.items.some(
      (i) =>
        typeof i.productId !== "string" ||
        !Number.isInteger(i.quantity) ||
        i.quantity < 1 ||
        i.quantity > 20,
    )
  )
    throw new ApiError(400, "Las cantidades deben ser enteros de 1 a 20.");
  if (
    !Number.isInteger(d.version) ||
    d.version < 0 ||
    typeof d.idempotencyKey !== "string" ||
    !/^[a-f0-9]{64}$/.test(d.idempotencyKey)
  )
    throw new ApiError(400, "El borrador no tiene un formato válido.");
  return d;
}
export function validateOrder(d: Draft) {
  const fields: Record<string, string> = {};
  if (!d.name.trim()) fields.name = "Escribe un nombre ficticio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()))
    fields.email = "Escribe un correo con formato válido.";
  if (Object.keys(fields).length)
    throw new ApiError(400, "Revisa los campos.", fields);
  if (!d.items.length) throw new ApiError(400, "Elige al menos un pan.");
}
export async function draftFor(sessionHash: string): Promise<Draft> {
  const db = database();
  await db.execute({
    sql: "INSERT INTO drafts(session_hash,idempotency_key) VALUES (?,?) ON CONFLICT(session_hash) DO NOTHING",
    args: [sessionHash, randomToken()],
  });
  const { rows } = await db.execute({
    sql: "SELECT * FROM drafts WHERE session_hash=?",
    args: [sessionHash],
  });
  const d = rows[0];
  const items = await db.execute({
    sql: "SELECT product_id AS productId,quantity FROM draft_items WHERE draft_id=? ORDER BY product_id",
    args: [d.id],
  });
  return {
    name: String(d.name),
    email: String(d.email),
    notes: String(d.notes),
    version: Number(d.version),
    idempotencyKey: String(d.idempotency_key),
    items: items.rows.map((i) => ({
      productId: String(i.productId),
      quantity: Number(i.quantity),
    })),
  };
}
export async function getOrder(token: string): Promise<SavedOrder | null> {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  await initialize();
  const db = database();
  const { rows } = await db.execute({
    sql: "SELECT * FROM orders WHERE token=?",
    args: [token],
  });
  if (!rows.length) return null;
  const o = rows[0];
  const lines = await db.execute({
    sql: "SELECT name,quantity FROM order_items WHERE order_id=? ORDER BY product_id",
    args: [o.id],
  });
  return {
    token: String(o.token),
    name: String(o.name),
    email: String(o.email),
    notes: String(o.notes),
    createdAt: String(o.created_at),
    items: lines.rows.map((i) => ({
      name: String(i.name),
      quantity: Number(i.quantity),
    })),
  };
}
