import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { companies, valuations } from "@/db/schema";

export async function getValuationsPageData() {
  const [companyRows, valuationRows] = await Promise.all([
    db.select().from(companies).orderBy(desc(companies.updatedAt)),
    db
      .select({
        valuation: valuations,
        company: companies
      })
      .from(valuations)
      .leftJoin(companies, eq(valuations.companyId, companies.id))
      .orderBy(desc(valuations.createdAt))
      .limit(8)
  ]);

  return {
    companies: companyRows,
    valuations: valuationRows
  };
}
