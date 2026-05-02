"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { companies, valuations } from "@/db/schema";
import {
  calculateValuation,
  type ValuationScenarioInput
} from "@/lib/valuations/calculations";
import { getTemplate, scenarios, type ScenarioName, type ValuationTemplateType } from "@/lib/valuations/constants";

const valuationSchema = z.object({
  companyId: z.string().trim().optional(),
  templateType: z.enum(["financial", "cyclical", "consumer", "manufacturing"]),
  title: z.string().trim().min(1, "请填写估值标题。"),
  valuationDate: z.string().trim().min(1, "请选择估值日期。"),
  currentPrice: z.coerce.number().nonnegative("当前价格不能为负。"),
  sharesOutstanding: z.coerce.number().positive("总股本必须大于 0。"),
  userNotes: z.string().trim().default("")
});

const scenarioSchema = z.object({
  basisAmount: z.coerce.number().nonnegative(),
  growthRate: z.coerce.number().default(0),
  valuationMultiple: z.coerce.number().nonnegative(),
  discountRate: z.coerce.number().positive().default(10),
  terminalGrowthRate: z.coerce.number().default(2),
  dividendYield: z.coerce.number().nonnegative().default(0),
  notes: z.string().trim().default("")
});

function now() {
  return new Date().toISOString();
}

function statusRedirect(status: string, message: string): never {
  redirect(`/valuations?status=${encodeURIComponent(status)}&message=${encodeURIComponent(message)}`);
}

export async function saveValuation(formData: FormData) {
  const parsed = valuationSchema.safeParse({
    companyId: String(formData.get("companyId") ?? "").trim() || undefined,
    templateType: formData.get("templateType"),
    title: formData.get("title"),
    valuationDate: formData.get("valuationDate"),
    currentPrice: formData.get("currentPrice"),
    sharesOutstanding: formData.get("sharesOutstanding"),
    userNotes: formData.get("userNotes")
  });

  if (!parsed.success) {
    statusRedirect("error", parsed.error.issues[0]?.message ?? "估值表单校验失败。");
  }

  const scenarioInputs = scenarios.map((scenario) =>
    parseScenario(formData, scenario.value)
  );
  const invalidScenario = scenarioInputs.find((scenario) => scenario.basisAmount <= 0);

  if (invalidScenario) {
    statusRedirect("error", "三个情景都需要填写有效的估值起点。");
  }

  const result = calculateValuation({
    templateType: parsed.data.templateType,
    currentPrice: parsed.data.currentPrice,
    sharesOutstanding: parsed.data.sharesOutstanding,
    scenarios: scenarioInputs
  });
  const template = getTemplate(parsed.data.templateType);
  const timestamp = now();

  await db.insert(valuations).values({
    id: crypto.randomUUID(),
    companyId: parsed.data.companyId ?? null,
    templateType: parsed.data.templateType,
    title: parsed.data.title || `${template.label}估值`,
    valuationDate: parsed.data.valuationDate,
    currentPrice: Math.round(parsed.data.currentPrice * 100),
    sharesOutstanding: Math.round(parsed.data.sharesOutstanding * 100),
    currency: "CNY",
    scenarioBearJson: JSON.stringify(scenarioInputs.find((scenario) => scenario.name === "bear")),
    scenarioBaseJson: JSON.stringify(scenarioInputs.find((scenario) => scenario.name === "base")),
    scenarioBullJson: JSON.stringify(scenarioInputs.find((scenario) => scenario.name === "bull")),
    resultJson: JSON.stringify(result),
    userNotes: parsed.data.userNotes,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  if (parsed.data.companyId) {
    await db
      .update(companies)
      .set({
        valuationStatus: "scenario",
        updatedAt: timestamp
      })
      .where(eq(companies.id, parsed.data.companyId));
  }

  revalidatePath("/valuations");
  revalidatePath("/watchlist");
  statusRedirect("success", "估值记录已保存。");
}

function parseScenario(formData: FormData, name: ScenarioName): ValuationScenarioInput {
  const parsed = scenarioSchema.safeParse({
    basisAmount: formData.get(`${name}.basisAmount`),
    growthRate: formData.get(`${name}.growthRate`),
    valuationMultiple: formData.get(`${name}.valuationMultiple`),
    discountRate: formData.get(`${name}.discountRate`),
    terminalGrowthRate: formData.get(`${name}.terminalGrowthRate`),
    dividendYield: formData.get(`${name}.dividendYield`),
    notes: formData.get(`${name}.notes`)
  });

  if (!parsed.success) {
    statusRedirect("error", `${name} 情景参数校验失败。`);
  }

  return {
    name,
    basisAmount: parsed.data.basisAmount,
    growthRate: parsed.data.growthRate / 100,
    valuationMultiple: parsed.data.valuationMultiple,
    discountRate: parsed.data.discountRate / 100,
    terminalGrowthRate: parsed.data.terminalGrowthRate / 100,
    dividendYield: parsed.data.dividendYield / 100,
    notes: parsed.data.notes
  };
}
