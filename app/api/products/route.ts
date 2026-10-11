import { initialize } from "@/lib/store";
import { database } from "@/lib/db";
import { errorResponse, privateHeaders } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await initialize();
    const { rows } = await database().execute(
      "SELECT * FROM products ORDER BY position",
    );
    return Response.json(rows, { headers: privateHeaders });
  } catch (e) {
    return errorResponse(e);
  }
}
