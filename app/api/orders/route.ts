import {
  initialize,
  validateDraft,
  validateOrder,
  ApiError,
  hash,
  randomToken,
} from "@/lib/store";
import { database } from "@/lib/db";
import { body, errorResponse, privateHeaders, session } from "@/lib/api";
export async function POST(req: Request) {
  try {
    const d = validateDraft(await body(req));
    validateOrder(d);
    await initialize();
    const sh = await session();
    const content = hash(
      JSON.stringify({
        name: d.name.trim(),
        email: d.email.trim(),
        notes: d.notes,
        items: [...d.items].sort((a, b) =>
          a.productId.localeCompare(b.productId),
        ),
      }),
    );
    const tx = await database().transaction("write");
    try {
      const prior = await tx.execute({
        sql: "SELECT token,content_hash,session_hash FROM orders WHERE idempotency_key=?",
        args: [d.idempotencyKey],
      });
      if (prior.rows.length) {
        const p = prior.rows[0];
        if (p.content_hash !== content || p.session_hash !== sh)
          throw new ApiError(
            409,
            "La clave de envío ya se usó con otro contenido. Edita el borrador antes de enviar de nuevo.",
          );
        await tx.commit();
        return Response.json({ token: p.token }, { headers: privateHeaders });
      }
      const draft = await tx.execute({
        sql: "SELECT idempotency_key,version FROM drafts WHERE session_hash=?",
        args: [sh],
      });
      if (
        !draft.rows.length ||
        draft.rows[0].idempotency_key !== d.idempotencyKey ||
        Number(draft.rows[0].version) !== d.version
      )
        throw new ApiError(
          409,
          "Guarda el borrador actualizado antes de enviar.",
        );
      const products = [];
      for (const i of d.items) {
        const p = await tx.execute({
          sql: "SELECT name FROM products WHERE id=?",
          args: [i.productId],
        });
        if (!p.rows.length)
          throw new ApiError(400, "Este pan no pertenece al catálogo.");
        products.push({ ...i, name: String(p.rows[0].name) });
      }
      const token = randomToken();
      const result = await tx.execute({
        sql: "INSERT INTO orders(token,name,email,notes,idempotency_key,session_hash,content_hash) VALUES (?,?,?,?,?,?,?)",
        args: [
          token,
          d.name.trim(),
          d.email.trim(),
          d.notes,
          d.idempotencyKey,
          sh,
          content,
        ],
      });
      for (const p of products)
        await tx.execute({
          sql: "INSERT INTO order_items(order_id,product_id,name,quantity) VALUES (?,?,?,?)",
          args: [result.lastInsertRowid!, p.productId, p.name, p.quantity],
        });
      await tx.commit();
      return Response.json({ token }, { status: 201, headers: privateHeaders });
    } catch (e) {
      await tx.rollback();
      throw e;
    } finally {
      tx.close();
    }
  } catch (e) {
    return errorResponse(e);
  }
}
