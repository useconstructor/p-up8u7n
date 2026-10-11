import { initialize, draftFor, validateDraft, ApiError } from "@/lib/store";
import { database } from "@/lib/db";
import { body, errorResponse, privateHeaders, session } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await initialize();
    return Response.json(await draftFor(await session(true)), {
      headers: privateHeaders,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function PATCH(req: Request) {
  try {
    const d = validateDraft(await body(req));
    await initialize();
    const sh = await session();
    const tx = await database().transaction("write");
    try {
      const { rows } = await tx.execute({
        sql: "SELECT id,version FROM drafts WHERE session_hash=?",
        args: [sh],
      });
      if (!rows.length || Number(rows[0].version) !== d.version)
        throw new ApiError(
          409,
          "El borrador cambió en otra ventana. Recarga para recuperar la última versión.",
        );
      for (const item of d.items) {
        const p = await tx.execute({
          sql: "SELECT id FROM products WHERE id=?",
          args: [item.productId],
        });
        if (!p.rows.length)
          throw new ApiError(400, "Este pan no pertenece al catálogo.");
      }
      const id = rows[0].id;
      await tx.execute({
        sql: "UPDATE drafts SET name=?,email=?,notes=?,idempotency_key=?,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=?",
        args: [d.name, d.email, d.notes, d.idempotencyKey, id],
      });
      await tx.execute({
        sql: "DELETE FROM draft_items WHERE draft_id=?",
        args: [id],
      });
      for (const i of d.items)
        await tx.execute({
          sql: "INSERT INTO draft_items(draft_id,product_id,quantity) VALUES (?,?,?)",
          args: [id, i.productId, i.quantity],
        });
      await tx.commit();
      return Response.json(
        { ...d, version: d.version + 1 },
        { headers: privateHeaders },
      );
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
