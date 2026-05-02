import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/local.db";

const client = createClient({
  url: databaseUrl.startsWith("file:") ? databaseUrl : `file:${databaseUrl}`
});

export const db = drizzle(client);
