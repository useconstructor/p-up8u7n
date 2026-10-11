import "server-only";
import { createClient, type Client } from "@libsql/client";
let client: Client;
export function database() {
  if (!process.env.TURSO_DATABASE_URL)
    throw new Error("Database configuration missing");
  return (client ??= createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  }));
}
