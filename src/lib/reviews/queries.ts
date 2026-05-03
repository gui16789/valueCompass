import { desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import {
  checklistRuns,
  companies,
  decisions,
  investmentPrinciples,
  reviews,
  valuations
} from "@/db/schema";

export async function getReviewsPageData() {
  const [decisionRows, pendingDecisionRows, reviewRows] = await Promise.all([
    db
      .select({
        decision: decisions,
        company: companies
      })
      .from(decisions)
      .leftJoin(companies, eq(decisions.companyId, companies.id))
      .orderBy(desc(decisions.createdAt))
      .limit(20),
    db
      .select({
        decision: decisions,
        company: companies
      })
      .from(decisions)
      .leftJoin(companies, eq(decisions.companyId, companies.id))
      .leftJoin(reviews, eq(reviews.decisionId, decisions.id))
      .where(isNull(reviews.id))
      .orderBy(desc(decisions.createdAt))
      .limit(8),
    db
      .select({
        review: reviews,
        decision: decisions,
        company: companies
      })
      .from(reviews)
      .leftJoin(decisions, eq(reviews.decisionId, decisions.id))
      .leftJoin(companies, eq(reviews.companyId, companies.id))
      .orderBy(desc(reviews.createdAt))
      .limit(10)
  ]);

  return {
    decisions: decisionRows,
    pendingDecisions: pendingDecisionRows,
    reviews: reviewRows
  };
}

export async function getDecisionDetailData(decisionId: string) {
  const [decisionRow] = await db
    .select({
      decision: decisions,
      company: companies,
      checklistRun: checklistRuns,
      principle: investmentPrinciples
    })
    .from(decisions)
    .leftJoin(companies, eq(decisions.companyId, companies.id))
    .leftJoin(checklistRuns, eq(decisions.checklistRunId, checklistRuns.id))
    .leftJoin(investmentPrinciples, eq(decisions.principleId, investmentPrinciples.id))
    .where(eq(decisions.id, decisionId))
    .limit(1);

  if (!decisionRow) {
    return null;
  }

  const [reviewRows, valuationRows] = await Promise.all([
    db
      .select({
        review: reviews
      })
      .from(reviews)
      .where(eq(reviews.decisionId, decisionId))
      .orderBy(desc(reviews.reviewDate), desc(reviews.createdAt)),
    decisionRow.decision.companyId
      ? db
          .select({
            valuation: valuations
          })
          .from(valuations)
          .where(eq(valuations.companyId, decisionRow.decision.companyId))
          .orderBy(desc(valuations.valuationDate), desc(valuations.createdAt))
          .limit(5)
      : Promise.resolve([])
  ]);

  return {
    ...decisionRow,
    reviews: reviewRows.map((row) => row.review),
    valuations: valuationRows.map((row) => row.valuation)
  };
}
