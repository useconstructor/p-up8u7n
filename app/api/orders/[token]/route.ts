import { getOrder } from "@/lib/store";
import { errorResponse, privateHeaders } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const order = await getOrder((await params).token);
    return Response.json(order ?? { error: "No encontramos ese pedido." }, {
      status: order ? 200 : 404,
      headers: privateHeaders,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
