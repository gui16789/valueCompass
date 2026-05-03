"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import {
  aiConversations,
  aiMessages,
  checklistRuns,
  companies,
  customChecklistTemplates,
  decisions,
  investmentPrinciples,
  knowledgeNodes,
  learningProgress,
  modelConfigs,
  modelProviders,
  reviews,
  trainingResults,
  valuations
} from "@/db/schema";
import { encryptSecret } from "@/lib/encryption/crypto";
import { aiRoles } from "@/lib/model-config/constants";
import { getModelProviderForTest } from "@/lib/model-config/queries";
import { runModelProviderTest } from "@/lib/model-config/test-provider";

const providerSchema = z.object({
  name: z.string().min(1, "请填写提供商名称"),
  apiBaseUrl: z.string().url("请填写有效的 API Base URL"),
  apiKey: z.string().min(1, "请填写 API Key"),
  defaultModelName: z.string().min(1, "请填写默认模型名称"),
  maxContextTokens: z.coerce.number().int().positive().default(8000),
  temperature: z.coerce.number().min(0).max(1).default(0.2),
  allowInsecureTls: z.boolean().default(false)
});

const updateProviderSchema = z.object({
  providerId: z.string().min(1),
  name: z.string().min(1, "请填写提供商名称"),
  apiBaseUrl: z.string().url("请填写有效的 API Base URL"),
  apiKey: z.string().optional(),
  defaultModelName: z.string().min(1, "请填写默认模型名称"),
  maxContextTokens: z.coerce.number().int().positive().default(8000),
  temperature: z.coerce.number().min(0).max(1).default(0.2),
  allowInsecureTls: z.boolean().default(false)
});

const roleConfigSchema = z.object({
  role: z.string().min(1),
  modelName: z.string().min(1),
  temperature: z.coerce.number().min(0).max(1)
});

const stringValue = z.string().default("");
const optionalStringValue = z.string().nullable().optional();
const booleanValue = z.coerce.boolean().default(false);
const integerValue = z.coerce.number().int().default(0);

const exportedProviderSchema = z.object({
  id: z.string().min(1),
  name: stringValue,
  apiBaseUrl: stringValue,
  isOpenAICompatible: booleanValue,
  allowInsecureTls: booleanValue,
  defaultModelName: stringValue,
  defaultTemperature: integerValue.default(20),
  maxContextTokens: integerValue.default(8000),
  status: stringValue.default("inactive"),
  lastTestStatus: stringValue.default("not_tested"),
  lastTestMessage: stringValue,
  lastTestedAt: optionalStringValue,
  createdAt: stringValue,
  updatedAt: stringValue
});

const importPayloadSchema = z.object({
  app: z.literal("Value Compass"),
  version: z.number().int().min(1),
  data: z.object({
    modelProviders: z.array(exportedProviderSchema).default([]),
    modelConfigs: z.array(z.object({
      id: z.string().min(1),
      providerId: z.string().min(1),
      role: stringValue,
      modelName: stringValue,
      temperature: integerValue.default(20),
      enabled: booleanValue,
      createdAt: stringValue,
      updatedAt: stringValue
    })).default([]),
    aiConversations: z.array(z.object({
      id: z.string().min(1),
      title: stringValue,
      role: stringValue,
      providerId: z.string().min(1),
      createdAt: stringValue,
      updatedAt: stringValue
    })).default([]),
    aiMessages: z.array(z.object({
      id: z.string().min(1),
      conversationId: z.string().min(1),
      role: stringValue,
      content: stringValue,
      modelName: stringValue,
      temperature: integerValue.default(20),
      createdAt: stringValue
    })).default([]),
    knowledgeNodes: z.array(z.object({
      id: z.string().min(1),
      type: stringValue,
      title: stringValue,
      summary: stringValue,
      body: stringValue,
      tagsJson: stringValue.default("[]"),
      orderIndex: integerValue,
      createdAt: stringValue,
      updatedAt: stringValue
    })).default([]),
    learningProgress: z.array(z.object({
      id: z.string().min(1),
      nodeId: z.string().min(1),
      status: stringValue.default("not_started"),
      masteryScore: integerValue,
      notes: stringValue,
      completedAt: optionalStringValue,
      createdAt: stringValue,
      updatedAt: stringValue
    })).default([]),
    trainingResults: z.array(z.object({
      id: z.string().min(1),
      questionSetJson: stringValue.default("[]"),
      answersJson: stringValue.default("{}"),
      weakTopicsJson: stringValue.default("[]"),
      answeredCount: integerValue,
      correctCount: integerValue,
      score: integerValue,
      reviewAdvice: stringValue,
      examinerPrompt: stringValue,
      createdAt: stringValue
    })).default([]),
    companies: z.array(z.object({
      id: z.string().min(1),
      stockCode: stringValue,
      stockName: stringValue,
      exchange: stringValue,
      industry: stringValue,
      companyType: stringValue.default("other"),
      watchStatus: stringValue.default("watching"),
      valuationStatus: stringValue.default("not_started"),
      inCircle: booleanValue,
      thesis: stringValue,
      keyRisks: stringValue,
      nextAction: stringValue,
      description: stringValue,
      createdAt: stringValue,
      updatedAt: stringValue
    })).default([]),
    investmentPrinciples: z.array(z.object({
      id: z.string().min(1),
      title: stringValue,
      circleOfCompetence: stringValue,
      excludedIndustries: stringValue,
      minimumFinancialQuality: stringValue,
      minimumMarginOfSafety: stringValue,
      positionRules: stringValue,
      buyRules: stringValue,
      sellRules: stringValue,
      doNothingRules: stringValue,
      riskRules: stringValue,
      version: integerValue.default(1),
      active: booleanValue.default(true),
      createdAt: stringValue,
      updatedAt: stringValue
    })).default([]),
    customChecklistTemplates: z.array(z.object({
      id: z.string().min(1),
      checklistType: stringValue,
      title: stringValue,
      itemsJson: stringValue.default("[]"),
      active: booleanValue.default(true),
      createdAt: stringValue,
      updatedAt: stringValue
    })).default([]),
    checklistRuns: z.array(z.object({
      id: z.string().min(1),
      checklistType: stringValue,
      companyId: optionalStringValue,
      principleId: optionalStringValue,
      itemsJson: stringValue.default("[]"),
      summary: stringValue,
      finalJudgment: stringValue,
      createdAt: stringValue,
      updatedAt: stringValue
    })).default([]),
    decisions: z.array(z.object({
      id: z.string().min(1),
      companyId: optionalStringValue,
      checklistRunId: optionalStringValue,
      principleId: optionalStringValue,
      decisionType: stringValue,
      finalUserJudgment: stringValue,
      keyAssumptions: stringValue,
      risks: stringValue,
      opponentSummary: stringValue,
      decisionDate: stringValue,
      createdAt: stringValue,
      updatedAt: stringValue
    })).default([]),
    valuations: z.array(z.object({
      id: z.string().min(1),
      companyId: optionalStringValue,
      templateType: stringValue,
      title: stringValue,
      valuationDate: stringValue,
      currentPrice: integerValue,
      sharesOutstanding: integerValue,
      currency: stringValue.default("CNY"),
      scenarioBearJson: stringValue.default("{}"),
      scenarioBaseJson: stringValue.default("{}"),
      scenarioBullJson: stringValue.default("{}"),
      resultJson: stringValue.default("{}"),
      userNotes: stringValue,
      createdAt: stringValue,
      updatedAt: stringValue
    })).default([]),
    reviews: z.array(z.object({
      id: z.string().min(1),
      decisionId: optionalStringValue,
      companyId: optionalStringValue,
      reviewType: stringValue.default("post_decision"),
      reviewDate: stringValue,
      whatHappened: stringValue,
      assumptionsValidated: stringValue,
      assumptionsFailed: stringValue,
      lessons: stringValue,
      principleChangesNeeded: stringValue,
      aiSummary: stringValue,
      createdAt: stringValue,
      updatedAt: stringValue
    })).default([])
  })
});

function now() {
  return new Date().toISOString();
}

function normalizeTemperature(value: number) {
  return Math.round(value * 100);
}

function statusRedirect(status: string, message: string): never {
  redirect(`/settings?status=${encodeURIComponent(status)}&message=${encodeURIComponent(message)}`);
}

export async function saveModelProvider(formData: FormData) {
  const parsed = providerSchema.safeParse({
    name: formData.get("name"),
    apiBaseUrl: formData.get("apiBaseUrl"),
    apiKey: formData.get("apiKey"),
    defaultModelName: formData.get("defaultModelName"),
    maxContextTokens: formData.get("maxContextTokens"),
    temperature: formData.get("temperature"),
    allowInsecureTls: formData.get("allowInsecureTls") === "on"
  });

  if (!parsed.success) {
    statusRedirect("error", parsed.error.issues[0]?.message ?? "模型配置校验失败。");
  }

  let apiKeyEncrypted = "";

  try {
    apiKeyEncrypted = encryptSecret(parsed.data.apiKey);
  } catch (error) {
    if (error instanceof Error && error.message === "APP_SECRET_MISSING") {
      statusRedirect("error", "请先在 .env.local 配置至少 24 位 APP_SECRET，然后重启开发服务器。");
    }

    statusRedirect("error", "API Key 加密失败，请检查本地配置。");
  }

  const providerId = crypto.randomUUID();
  const createdAt = now();
  const temperature = normalizeTemperature(parsed.data.temperature);

  await db.insert(modelProviders).values({
    id: providerId,
    name: parsed.data.name,
    apiBaseUrl: parsed.data.apiBaseUrl,
    apiKeyEncrypted,
    isOpenAICompatible: true,
    allowInsecureTls: parsed.data.allowInsecureTls,
    defaultModelName: parsed.data.defaultModelName,
    defaultTemperature: temperature,
    maxContextTokens: parsed.data.maxContextTokens,
    status: "active",
    lastTestStatus: "not_tested",
    lastTestMessage: "",
    createdAt,
    updatedAt: createdAt
  });

  await db.insert(modelConfigs).values(
    aiRoles.map((role) => ({
      id: crypto.randomUUID(),
      providerId,
      role: role.value,
      modelName: parsed.data.defaultModelName,
      temperature,
      enabled: true,
      createdAt,
      updatedAt: createdAt
    }))
  );

  revalidatePath("/settings");
  statusRedirect("success", "模型提供商已保存，建议继续执行连接测试。");
}

export async function updateModelProvider(formData: FormData) {
  const parsed = updateProviderSchema.safeParse({
    providerId: formData.get("providerId"),
    name: formData.get("name"),
    apiBaseUrl: formData.get("apiBaseUrl"),
    apiKey: String(formData.get("apiKey") ?? "").trim() || undefined,
    defaultModelName: formData.get("defaultModelName"),
    maxContextTokens: formData.get("maxContextTokens"),
    temperature: formData.get("temperature"),
    allowInsecureTls: formData.get("allowInsecureTls") === "on"
  });

  if (!parsed.success) {
    statusRedirect("error", parsed.error.issues[0]?.message ?? "模型配置校验失败。");
  }

  const existingProvider = await getModelProviderForTest(parsed.data.providerId);

  if (!existingProvider) {
    statusRedirect("error", "没有找到这个模型提供商。");
  }

  const updatedAt = now();
  const temperature = normalizeTemperature(parsed.data.temperature);
  const updateValues: Partial<typeof modelProviders.$inferInsert> = {
    name: parsed.data.name,
    apiBaseUrl: parsed.data.apiBaseUrl,
    allowInsecureTls: parsed.data.allowInsecureTls,
    defaultModelName: parsed.data.defaultModelName,
    defaultTemperature: temperature,
    maxContextTokens: parsed.data.maxContextTokens,
    lastTestStatus: "not_tested",
    lastTestMessage: "配置已更新，请重新测试连接。",
    lastTestedAt: null,
    updatedAt
  };

  if (parsed.data.apiKey) {
    try {
      updateValues.apiKeyEncrypted = encryptSecret(parsed.data.apiKey);
    } catch (error) {
      if (error instanceof Error && error.message === "APP_SECRET_MISSING") {
        statusRedirect("error", "请先在 .env.local 配置至少 24 位 APP_SECRET，然后重启开发服务器。");
      }

      statusRedirect("error", "API Key 加密失败，请检查本地配置。");
    }
  }

  await db
    .update(modelProviders)
    .set(updateValues)
    .where(eq(modelProviders.id, parsed.data.providerId));

  await db
    .delete(modelConfigs)
    .where(eq(modelConfigs.providerId, parsed.data.providerId));

  const roleConfigs = aiRoles.map((role) => {
    const modelName =
      String(formData.get(`roleModelName.${role.value}`) ?? "").trim() ||
      parsed.data.defaultModelName;
    const roleConfig = roleConfigSchema.safeParse({
      role: role.value,
      modelName,
      temperature:
        formData.get(`roleTemperature.${role.value}`) ??
        parsed.data.temperature
    });

    if (!roleConfig.success) {
      statusRedirect("error", `${role.label} 的模型或温度配置无效。`);
    }

    return {
      id: crypto.randomUUID(),
      providerId: parsed.data.providerId,
      role: role.value,
      modelName,
      temperature: normalizeTemperature(roleConfig.data.temperature),
      enabled: true,
      createdAt: updatedAt,
      updatedAt
    };
  });

  await db.insert(modelConfigs).values(roleConfigs);

  revalidatePath("/settings");
  statusRedirect("success", "模型提供商已更新，请重新测试连接。");
}

export async function testModelProvider(formData: FormData) {
  const providerId = String(formData.get("providerId") ?? "");
  const provider = await getModelProviderForTest(providerId);

  if (!provider) {
    statusRedirect("error", "没有找到这个模型提供商。");
  }

  let status: "success" | "error" = "success";
  let message = "连接测试成功。";

  const result = await runModelProviderTest(providerId);

  if (!result.ok) {
    status = "error";
    message = result.message;
  }

  revalidatePath("/settings");
  statusRedirect(status, message);
}

export async function toggleProviderTlsMode(formData: FormData) {
  const providerId = String(formData.get("providerId") ?? "");
  const allowInsecureTls = formData.get("allowInsecureTls") === "true";

  await db
    .update(modelProviders)
    .set({
      allowInsecureTls,
      lastTestStatus: "not_tested",
      lastTestMessage: allowInsecureTls
        ? "已开启跳过 TLS 证书校验。请仅用于你信任的自建或代理模型服务。"
        : "已关闭跳过 TLS 证书校验。",
      updatedAt: now()
    })
    .where(eq(modelProviders.id, providerId));

  revalidatePath("/settings");
  statusRedirect("success", allowInsecureTls ? "已开启跳过 TLS 证书校验，请重新测试连接。" : "已关闭跳过 TLS 证书校验。");
}

export async function deleteModelProvider(formData: FormData) {
  const providerId = String(formData.get("providerId") ?? "");

  await db.delete(modelProviders).where(eq(modelProviders.id, providerId));

  revalidatePath("/settings");
  statusRedirect("success", "模型提供商已删除。");
}

export async function importBackup(formData: FormData) {
  const file = formData.get("backupFile");
  const confirmed = formData.get("confirmImport") === "on";

  if (!confirmed) {
    statusRedirect("error", "导入前请先勾选确认：我已了解导入会合并/覆盖同 ID 的本地记录。");
  }

  if (!(file instanceof File) || file.size === 0) {
    statusRedirect("error", "请选择一个 Value Compass JSON 备份文件。");
  }

  if (file.size > 10 * 1024 * 1024) {
    statusRedirect("error", "备份文件过大，当前导入上限为 10MB。");
  }

  const content = await file.text();
  let rawPayload: unknown;

  try {
    rawPayload = JSON.parse(content);
  } catch {
    statusRedirect("error", "备份文件不是有效的 JSON。");
  }

  const parsed = importPayloadSchema.safeParse(rawPayload);

  if (!parsed.success) {
    statusRedirect("error", parsed.error.issues[0]?.message ?? "备份文件格式不正确。");
  }

  const { data } = parsed.data;
  const importedAt = now();
  const importedCounts = {
    modelProviders: 0,
    modelConfigs: 0,
    aiConversations: 0,
    aiMessages: 0,
    knowledgeNodes: 0,
    learningProgress: 0,
    trainingResults: 0,
    companies: 0,
    investmentPrinciples: 0,
    customChecklistTemplates: 0,
    checklistRuns: 0,
    decisions: 0,
    valuations: 0,
    reviews: 0
  };

  for (const row of data.modelProviders) {
    const existingProvider = await getModelProviderForTest(row.id);
    const providerValues = {
      ...row,
      status: existingProvider ? row.status : "inactive",
      lastTestStatus: "not_tested",
      lastTestMessage: existingProvider
        ? "备份已导入。API Key 沿用本地已有密钥，请重新测试连接。"
        : "备份已导入，但导出文件不含 API Key。请编辑并补充 API Key。",
      lastTestedAt: null,
      updatedAt: row.updatedAt || importedAt
    };

    if (existingProvider) {
      await db.update(modelProviders).set(providerValues).where(eq(modelProviders.id, row.id));
    } else {
      await db.insert(modelProviders).values({
        ...providerValues,
        apiKeyEncrypted: "",
        createdAt: row.createdAt || importedAt
      });
    }

    importedCounts.modelProviders += 1;
  }

  importedCounts.modelConfigs = await upsertRows(modelConfigs, data.modelConfigs);
  importedCounts.aiConversations = await upsertRows(aiConversations, data.aiConversations);
  importedCounts.aiMessages = await upsertRows(aiMessages, data.aiMessages);
  importedCounts.knowledgeNodes = await upsertRows(knowledgeNodes, data.knowledgeNodes);
  importedCounts.learningProgress = await upsertRows(learningProgress, data.learningProgress);
  importedCounts.trainingResults = await upsertRows(trainingResults, data.trainingResults);
  importedCounts.companies = await upsertRows(companies, data.companies);
  importedCounts.investmentPrinciples = await upsertRows(investmentPrinciples, data.investmentPrinciples);
  importedCounts.customChecklistTemplates = await upsertRows(customChecklistTemplates, data.customChecklistTemplates);
  importedCounts.checklistRuns = await upsertRows(checklistRuns, data.checklistRuns);
  importedCounts.decisions = await upsertRows(decisions, data.decisions);
  importedCounts.valuations = await upsertRows(valuations, data.valuations);
  importedCounts.reviews = await upsertRows(reviews, data.reviews);

  revalidatePath("/");
  revalidatePath("/learn");
  revalidatePath("/training");
  revalidatePath("/settings");
  revalidatePath("/watchlist");
  revalidatePath("/valuations");
  revalidatePath("/system");
  revalidatePath("/reviews");
  revalidatePath("/mentor");

  statusRedirect("success", `备份导入完成：${formatImportSummary(importedCounts)}。模型 API Key 不会从备份导入，请按需重新编辑模型提供商。`);
}

async function upsertRows<T extends { id: string }>(
  table: { id: unknown },
  rows: T[]
) {
  let count = 0;

  for (const row of rows) {
    const { id, ...setValues } = row;
    await db
      .insert(table as never)
      .values(row as never)
      .onConflictDoUpdate({
        target: table.id as never,
        set: setValues as never
      });
    count += 1;
  }

  return count;
}

function formatImportSummary(counts: Record<string, number>) {
  const labels: Record<string, string> = {
    modelProviders: "模型提供商",
    modelConfigs: "角色配置",
    aiConversations: "AI 对话",
    aiMessages: "AI 消息",
    knowledgeNodes: "知识节点",
    learningProgress: "学习进度",
    trainingResults: "训练结果",
    companies: "观察池公司",
    investmentPrinciples: "投资原则",
    customChecklistTemplates: "自定义清单",
    checklistRuns: "检查记录",
    decisions: "决策日志",
    valuations: "估值记录",
    reviews: "复盘记录"
  };

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${labels[key] ?? key} ${count}`)
    .join("，") || "没有可导入记录";
}
