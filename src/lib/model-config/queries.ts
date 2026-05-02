import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { modelConfigs, modelProviders } from "@/db/schema";

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
