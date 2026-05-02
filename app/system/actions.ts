"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { checklistRuns, decisions, investmentPrinciples } from "@/db/schema";
import { checklistTemplates, checklistTypes, labelFor } from "@/lib/investment-system/constants";
import { getActiveInvestmentPrinciple } from "@/lib/investment-system/queries";

const principleSchema = z.object({
  principleId: z.string().optional(),
  title: z.string().trim().min(1, "请填写原则名称。"),
  circleOfCompetence: z.string().trim().default(""),
  excludedIndustries: z.string().trim().default(""),
  minimumFinancialQuality: z.string().trim().default(""),
  minimumMarginOfSafety: z.string().trim().default(""),
  positionRules: z.string().trim().default(""),
  buyRules: z.string().trim().default(""),
  sellRules: z.string().trim().default(""),
  doNothingRules: z.string().trim().default(""),
  riskRules: z.string().trim().default("")
});

const runSchema = z.object({
  checklistType: z.enum(["buy", "sell", "do_nothing"]),
  companyId: z.string().trim().optional(),
  finalJudgment: z.string().trim().min(1, "请填写你自己的最终判断。"),
  keyAssumptions: z.string().trim().default(""),
  risks: z.string().trim().default(""),
  summary: z.string().trim().default("")
});

function now() {
  return new Date().toISOString();
}

function statusRedirect(status: string, message: string): never {
  redirect(`/system?status=${encodeURIComponent(status)}&message=${encodeURIComponent(message)}`);
}

export async function saveInvestmentPrinciple(formData: FormData) {
  const parsed = principleSchema.safeParse({
    principleId: String(formData.get("principleId") ?? "").trim() || undefined,
    title: formData.get("title"),
    circleOfCompetence: formData.get("circleOfCompetence"),
    excludedIndustries: formData.get("excludedIndustries"),
    minimumFinancialQuality: formData.get("minimumFinancialQuality"),
    minimumMarginOfSafety: formData.get("minimumMarginOfSafety"),
    positionRules: formData.get("positionRules"),
    buyRules: formData.get("buyRules"),
    sellRules: formData.get("sellRules"),
    doNothingRules: formData.get("doNothingRules"),
    riskRules: formData.get("riskRules")
  });

  if (!parsed.success) {
    statusRedirect("error", parsed.error.issues[0]?.message ?? "投资原则校验失败。");
  }

  const updatedAt = now();

  if (parsed.data.principleId) {
    const { principleId, ...values } = parsed.data;
    await db
      .update(investmentPrinciples)
      .set({
        ...values,
        version: 1,
        active: true,
        updatedAt
      })
      .where(eq(investmentPrinciples.id, principleId));
  } else {
    await db.insert(investmentPrinciples).values({
      id: crypto.randomUUID(),
      title: parsed.data.title,
      circleOfCompetence: parsed.data.circleOfCompetence,
      excludedIndustries: parsed.data.excludedIndustries,
      minimumFinancialQuality: parsed.data.minimumFinancialQuality,
      minimumMarginOfSafety: parsed.data.minimumMarginOfSafety,
      positionRules: parsed.data.positionRules,
      buyRules: parsed.data.buyRules,
      sellRules: parsed.data.sellRules,
      doNothingRules: parsed.data.doNothingRules,
      riskRules: parsed.data.riskRules,
      version: 1,
      active: true,
      createdAt: updatedAt,
      updatedAt
    });
  }

  revalidatePath("/system");
  statusRedirect("success", "投资原则已保存。");
}

export async function saveChecklistRun(formData: FormData) {
  const parsed = runSchema.safeParse({
    checklistType: formData.get("checklistType"),
    companyId: String(formData.get("companyId") ?? "").trim() || undefined,
    finalJudgment: formData.get("finalJudgment"),
    keyAssumptions: formData.get("keyAssumptions"),
    risks: formData.get("risks"),
    summary: formData.get("summary")
  });

  if (!parsed.success) {
    statusRedirect("error", parsed.error.issues[0]?.message ?? "检查清单校验失败。");
  }

  const template = checklistTemplates[parsed.data.checklistType];
  const items = template.map((item) => {
    const status = String(formData.get(`status.${item.id}`) ?? "unknown");
    const normalizedStatus = ["pass", "fail", "unknown", "not_applicable"].includes(status)
      ? status
      : "unknown";

    return {
      id: item.id,
      text: item.text,
      category: item.category,
      required: item.required,
      status: normalizedStatus,
      note: String(formData.get(`note.${item.id}`) ?? "").trim()
    };
  });

  const requiredIssues = items.filter(
    (item) => item.required && (item.status === "fail" || item.status === "unknown")
  );
  const principle = await getActiveInvestmentPrinciple();
  const timestamp = now();
  const checklistRunId = crypto.randomUUID();
  const decisionId = crypto.randomUUID();
  const checklistLabel = labelFor(checklistTypes, parsed.data.checklistType);
  const summary =
    parsed.data.summary ||
    `完成${checklistLabel}，关键未确认/失败项 ${requiredIssues.length} 项。`;

  await db.insert(checklistRuns).values({
    id: checklistRunId,
    checklistType: parsed.data.checklistType,
    companyId: parsed.data.companyId ?? null,
    principleId: principle?.id ?? null,
    itemsJson: JSON.stringify(items),
    summary,
    finalJudgment: parsed.data.finalJudgment,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  await db.insert(decisions).values({
    id: decisionId,
    companyId: parsed.data.companyId ?? null,
    checklistRunId,
    principleId: principle?.id ?? null,
    decisionType: parsed.data.checklistType,
    finalUserJudgment: parsed.data.finalJudgment,
    keyAssumptions: parsed.data.keyAssumptions,
    risks: parsed.data.risks,
    opponentSummary: "",
    decisionDate: timestamp.slice(0, 10),
    createdAt: timestamp,
    updatedAt: timestamp
  });

  revalidatePath("/system");
  statusRedirect("success", "检查清单和决策记录已保存。");
}
