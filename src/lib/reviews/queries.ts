import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { companies, decisions, reviews } from "@/db/schema";

export async function getReviewsPageData() {
  const [decisionRows, reviewRows] = await Promise.all([
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
    reviews: reviewRows
  };
}
