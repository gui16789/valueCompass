import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { companies } from "@/db/schema";

export async function getWatchlistCompanies() {
  return db.select().from(companies).orderBy(desc(companies.updatedAt));
}
