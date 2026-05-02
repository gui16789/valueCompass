import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { checklistRuns, companies, customChecklistTemplates, decisions, investmentPrinciples } from "@/db/schema";
import {
  checklistTypes,
  getDefaultChecklistTemplate,
  parseChecklistTemplateItems,
  type ChecklistType,
  type EffectiveChecklistTemplate
} from "@/lib/investment-system/constants";

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
  const [principle, companyRows, runRows, decisionRows, templates] = await Promise.all([
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
      .limit(6),
    getEffectiveChecklistTemplates()
  ]);

  return {
    principle,
    companies: companyRows,
    recentRuns: runRows,
    recentDecisions: decisionRows,
    checklistTemplates: templates
  };
}

export async function getEffectiveChecklistTemplates(): Promise<Record<ChecklistType, EffectiveChecklistTemplate>> {
  const rows = await db
    .select()
    .from(customChecklistTemplates)
    .where(eq(customChecklistTemplates.active, true))
    .orderBy(desc(customChecklistTemplates.updatedAt));

  return checklistTypes.reduce((templates, item) => {
    const type = item.value as ChecklistType;
    const custom = rows.find((row) => row.checklistType === type);

    templates[type] = custom
      ? {
          type,
          title: custom.title,
          items: parseChecklistTemplateItems(custom.itemsJson, type),
          isCustom: true,
          updatedAt: custom.updatedAt
        }
      : getDefaultChecklistTemplate(type);

    return templates;
  }, {} as Record<ChecklistType, EffectiveChecklistTemplate>);
}

export async function getEffectiveChecklistTemplate(type: ChecklistType) {
  const templates = await getEffectiveChecklistTemplates();

  return templates[type];
}
