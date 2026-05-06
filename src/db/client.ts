import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { dirname } from "node:path";
import { mkdirSync } from "node:fs";

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/local.db";
const normalizedDatabaseUrl = databaseUrl.startsWith("file:") ? databaseUrl : `file:${databaseUrl}`;

function ensureLocalDatabaseDirectory(url: string) {
  if (!url.startsWith("file:")) {
    return;
  }

  const databasePath = url.slice("file:".length);
  if (!databasePath || databasePath === ":memory:") {
    return;
  }

  const databaseDirectory = dirname(databasePath);
  if (databaseDirectory !== ".") {
    mkdirSync(databaseDirectory, { recursive: true });
  }
}

ensureLocalDatabaseDirectory(normalizedDatabaseUrl);

const client = createClient({
  url: normalizedDatabaseUrl
});

export const db = drizzle(client);
