import { cookies } from "next/headers";
import { ApiError, hash, randomToken } from "./store";
export const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};
export async function session(create = false) {
  const jar = await cookies();
  let token = jar.get("miga_draft")?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    if (!create)
      throw new ApiError(401, "Recarga la página para recuperar tu borrador.");
    token = randomToken();
    jar.set("miga_draft", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      partitioned: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return hash(token);
}
export async function body(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin)
    throw new ApiError(403, "Solicitud no permitida.");
  const raw = await req.text();
  if (raw.length > 16384)
    throw new ApiError(413, "El texto es demasiado largo.");
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, "Solicitud no válida.");
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof ApiError)
    return Response.json(
      { error: error.message, fields: error.fields },
      { status: error.status, headers: privateHeaders },
    );
  return Response.json(
    {
      error:
        "No se pudo conectar con el guardado. Tus datos siguen aquí; vuelve a intentarlo.",
    },
    { status: 503, headers: privateHeaders },
  );
}
