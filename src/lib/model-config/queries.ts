import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { modelConfigs, modelProviders } from "@/db/schema";
import type { AiRole } from "@/lib/ai/types";

export async function getModelProvidersWithConfigs() {
  const [providers, configs] = await Promise.all([
    db.select().from(modelProviders),
    db.select().from(modelConfigs)
  ]);

  return providers.map((provider) => ({
    ...provider,
    configs: configs.filter((config) => config.providerId === provider.id)
  }));
}

export async function getModelProviderForTest(providerId: string) {
  const [provider] = await db.select().from(modelProviders).where(eq(modelProviders.id, providerId));

  return provider;
}

export async function getModelProviderForRole(role: AiRole) {
  const [providers, configs] = await Promise.all([
    db.select().from(modelProviders).where(eq(modelProviders.status, "active")),
    db.select().from(modelConfigs)
  ]);

  if (providers.length === 0) {
    return null;
  }

  const successProvider = providers.find((provider) => provider.lastTestStatus === "success");
  const provider = successProvider ?? providers[0];
  const providerConfigs = configs.filter((config) => config.providerId === provider.id);
  const config =
    providerConfigs.find((item) => item.role === role && item.enabled) ??
    providerConfigs.find((item) => item.enabled);

  return {
    provider,
    modelName: config?.modelName ?? provider.defaultModelName,
    temperature: config?.temperature ?? provider.defaultTemperature
  };
}
