import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { checklistRuns, companies, companyResearchSources, decisions, valuations } from "@/db/schema";

export async function getWatchlistCompanies() {
  return db.select().from(companies).orderBy(desc(companies.updatedAt));
}

export async function getCompanyResearchPageData(companyId: string) {
  const [companyRows, sourceRows, valuationRows, checklistRows, decisionRows] = await Promise.all([
    db.select().from(companies).where(eq(companies.id, companyId)).limit(1),
    db
      .select()
      .from(companyResearchSources)
      .where(and(eq(companyResearchSources.companyId, companyId), eq(companyResearchSources.active, true)))
      .orderBy(desc(companyResearchSources.updatedAt)),
    db
      .select()
      .from(valuations)
      .where(eq(valuations.companyId, companyId))
      .orderBy(desc(valuations.createdAt))
      .limit(6),
    db
      .select()
      .from(checklistRuns)
      .where(eq(checklistRuns.companyId, companyId))
      .orderBy(desc(checklistRuns.createdAt))
      .limit(6),
    db
      .select()
      .from(decisions)
      .where(eq(decisions.companyId, companyId))
      .orderBy(desc(decisions.createdAt))
      .limit(6)
  ]);

  return {
    company: companyRows[0] ?? null,
    sources: sourceRows,
    valuations: valuationRows,
    checklistRuns: checklistRows,
    decisions: decisionRows
  };
}
