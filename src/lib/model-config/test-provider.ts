import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { modelProviders } from "@/db/schema";
import { testOpenAICompatibleConfig } from "@/lib/ai/openai-compatible";
import { decryptSecret } from "@/lib/encryption/crypto";
import { getModelProviderForTest } from "@/lib/model-config/queries";

function now() {
  return new Date().toISOString();
}

export async function runModelProviderTest(providerId: string) {
  const provider = await getModelProviderForTest(providerId);

  if (!provider) {
    return {
      ok: false,
      status: "failed",
      message: "没有找到这个模型提供商。",
      testedAt: now()
    };
  }

  try {
    const apiKey = decryptSecret(provider.apiKeyEncrypted);
    const response = await testOpenAICompatibleConfig({
      apiBaseUrl: provider.apiBaseUrl,
      apiKey,
      model: provider.defaultModelName,
      temperature: provider.defaultTemperature / 100,
      allowInsecureTls: provider.allowInsecureTls
    });
    const testedAt = now();
    const message = response.slice(0, 180);

    await db
      .update(modelProviders)
      .set({
        lastTestStatus: "success",
        lastTestMessage: message,
        lastTestedAt: testedAt,
        updatedAt: testedAt
      })
      .where(eq(modelProviders.id, providerId));

    return {
      ok: true,
      status: "success",
      message,
      testedAt
    };
  } catch (error) {
    const testedAt = now();
    const message = error instanceof Error ? error.message : "连接测试失败。";

    await db
      .update(modelProviders)
      .set({
        lastTestStatus: "failed",
        lastTestMessage: message.slice(0, 180),
        lastTestedAt: testedAt,
        updatedAt: testedAt
      })
      .where(eq(modelProviders.id, providerId));

    return {
      ok: false,
      status: "failed",
      message,
      testedAt
    };
  }
}
