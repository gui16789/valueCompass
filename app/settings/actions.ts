"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { modelConfigs, modelProviders } from "@/db/schema";
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
    .update(modelConfigs)
    .set({
      modelName: parsed.data.defaultModelName,
      temperature,
      updatedAt
    })
    .where(eq(modelConfigs.providerId, parsed.data.providerId));

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
