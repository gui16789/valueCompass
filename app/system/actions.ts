"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { checklistRuns, customChecklistTemplates, decisions, investmentPrinciples } from "@/db/schema";
import { checklistTypes, labelFor, type ChecklistTemplateItem } from "@/lib/investment-system/constants";
import { getActiveInvestmentPrinciple, getEffectiveChecklistTemplate } from "@/lib/investment-system/queries";

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

const templateSchema = z.object({
  checklistType: z.enum(["buy", "sell", "do_nothing"]),
  title: z.string().trim().min(1, "请填写模板名称。"),
  itemsJson: z.string().trim().min(1, "请至少保留 1 个检查项。")
});

const templateItemSchema = z.array(
  z.object({
    id: z.string().trim().optional(),
    text: z.string().trim(),
    category: z.string().trim().optional(),
    required: z.boolean().default(false)
  })
).max(20, "每个模板最多保留 20 个检查项。");

const safeItemIdPattern = /^[a-zA-Z0-9_-]+$/;

function now() {
  return new Date().toISOString();
}

function statusRedirect(status: string, message: string): never {
  redirect(`/system?status=${encodeURIComponent(status)}&message=${encodeURIComponent(message)}`);
}

function principleValuesChanged(
  current: typeof investmentPrinciples.$inferSelect,
  next: Omit<z.infer<typeof principleSchema>, "principleId">
) {
  return (
    current.title !== next.title ||
    current.circleOfCompetence !== next.circleOfCompetence ||
    current.excludedIndustries !== next.excludedIndustries ||
    current.minimumFinancialQuality !== next.minimumFinancialQuality ||
    current.minimumMarginOfSafety !== next.minimumMarginOfSafety ||
    current.positionRules !== next.positionRules ||
    current.buyRules !== next.buyRules ||
    current.sellRules !== next.sellRules ||
    current.doNothingRules !== next.doNothingRules ||
    current.riskRules !== next.riskRules
  );
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
    const [currentPrinciple] = await db
      .select()
      .from(investmentPrinciples)
      .where(eq(investmentPrinciples.id, principleId))
      .limit(1);

    if (!currentPrinciple) {
      statusRedirect("error", "未找到要更新的投资原则。");
    }

    if (!principleValuesChanged(currentPrinciple, values)) {
      statusRedirect("success", `投资原则未变化，仍为 v${currentPrinciple.version}。`);
    }

    await db
      .update(investmentPrinciples)
      .set({
        active: false
      })
      .where(eq(investmentPrinciples.active, true));

    await db.insert(investmentPrinciples).values({
      id: crypto.randomUUID(),
      title: values.title,
      circleOfCompetence: values.circleOfCompetence,
      excludedIndustries: values.excludedIndustries,
      minimumFinancialQuality: values.minimumFinancialQuality,
      minimumMarginOfSafety: values.minimumMarginOfSafety,
      positionRules: values.positionRules,
      buyRules: values.buyRules,
      sellRules: values.sellRules,
      doNothingRules: values.doNothingRules,
      riskRules: values.riskRules,
      version: currentPrinciple.version + 1,
      active: true,
      createdAt: updatedAt,
      updatedAt
    });
  } else {
    const [latestPrinciple] = await db
      .select()
      .from(investmentPrinciples)
      .orderBy(desc(investmentPrinciples.version), desc(investmentPrinciples.createdAt))
      .limit(1);

    await db
      .update(investmentPrinciples)
      .set({
        active: false
      })
      .where(eq(investmentPrinciples.active, true));

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
      version: latestPrinciple ? latestPrinciple.version + 1 : 1,
      active: true,
      createdAt: updatedAt,
      updatedAt
    });
  }

  revalidatePath("/system");
  statusRedirect("success", "投资原则已保存为新版本。");
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

  const template = await getEffectiveChecklistTemplate(parsed.data.checklistType);
  const items = template.items.map((item) => {
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

export async function saveChecklistTemplate(formData: FormData) {
  const parsed = templateSchema.safeParse({
    checklistType: formData.get("checklistType"),
    title: formData.get("title"),
    itemsJson: formData.get("itemsJson")
  });

  if (!parsed.success) {
    statusRedirect("error", parsed.error.issues[0]?.message ?? "清单模板校验失败。");
  }

  let rawItems: unknown;

  try {
    rawItems = JSON.parse(parsed.data.itemsJson);
  } catch {
    statusRedirect("error", "检查项数据格式不正确，请刷新后重试。");
  }

  const parsedItems = templateItemSchema.safeParse(rawItems);

  if (!parsedItems.success) {
    statusRedirect("error", parsedItems.error.issues[0]?.message ?? "检查项校验失败。");
  }

  const usedIds = new Set<string>();
  const items = parsedItems.data
    .map((item, index) => {
      const fallbackId = `${parsed.data.checklistType}_${index + 1}`;
      const rawId = item.id && safeItemIdPattern.test(item.id) ? item.id : fallbackId;
      const id = usedIds.has(rawId) ? fallbackId : rawId;
      usedIds.add(id);

      return {
        id,
        text: item.text,
        category: item.category?.trim() || "通用",
        required: item.required
      };
    })
    .filter((item): item is ChecklistTemplateItem => Boolean(item.text));

  if (items.length === 0) {
    statusRedirect("error", "至少保留 1 个检查项。");
  }

  const timestamp = now();
  const [existingTemplate] = await db
    .select()
    .from(customChecklistTemplates)
    .where(eq(customChecklistTemplates.checklistType, parsed.data.checklistType))
    .limit(1);

  if (existingTemplate) {
    await db
      .update(customChecklistTemplates)
      .set({
        title: parsed.data.title,
        itemsJson: JSON.stringify(items),
        active: true,
        updatedAt: timestamp
      })
      .where(eq(customChecklistTemplates.id, existingTemplate.id));
  } else {
    await db.insert(customChecklistTemplates).values({
      id: crypto.randomUUID(),
      checklistType: parsed.data.checklistType,
      title: parsed.data.title,
      itemsJson: JSON.stringify(items),
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }

  revalidatePath("/system");
  statusRedirect("success", "检查清单模板已保存。");
}
