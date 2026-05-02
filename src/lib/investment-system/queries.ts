import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { checklistRuns, companies, decisions, investmentPrinciples } from "@/db/schema";

export async function getActiveInvestmentPrinciple() {
  const [principle] = await db
    .select()
    .from(investmentPrinciples)
    .where(eq(investmentPrinciples.active, true))
    .orderBy(desc(investmentPrinciples.updatedAt))
    .limit(1);

  return principle;
}

export async function getSystemPageData() {
  const [principle, companyRows, runRows, decisionRows] = await Promise.all([
    getActiveInvestmentPrinciple(),
    db.select().from(companies).orderBy(desc(companies.updatedAt)),
    db
      .select({
        run: checklistRuns,
        company: companies
      })
      .from(checklistRuns)
      .leftJoin(companies, eq(checklistRuns.companyId, companies.id))
      .orderBy(desc(checklistRuns.createdAt))
      .limit(6),
    db
      .select({
        decision: decisions,
        company: companies
      })
      .from(decisions)
      .leftJoin(companies, eq(decisions.companyId, companies.id))
      .orderBy(desc(decisions.createdAt))
      .limit(6)
  ]);

  return {
    principle,
    companies: companyRows,
    recentRuns: runRows,
    recentDecisions: decisionRows
  };
}
