"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { companies } from "@/db/schema";

const companySchema = z.object({
  stockCode: z.string().trim().min(1, "请填写股票代码"),
  stockName: z.string().trim().min(1, "请填写公司名称"),
  exchange: z.string().trim().min(1),
  industry: z.string().trim().default(""),
  companyType: z.string().trim().default("other"),
  watchStatus: z.string().trim().default("watching"),
  valuationStatus: z.string().trim().default("not_started"),
  inCircle: z.boolean().default(false),
  thesis: z.string().trim().default(""),
  keyRisks: z.string().trim().default(""),
  nextAction: z.string().trim().default(""),
  description: z.string().trim().default("")
});

const updateSchema = companySchema.extend({
  companyId: z.string().trim().min(1)
});

function now() {
  return new Date().toISOString();
}

function normalizeCode(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

export async function addCompany(formData: FormData) {
  const parsed = companySchema.safeParse({
    stockCode: formData.get("stockCode"),
    stockName: formData.get("stockName"),
    exchange: formData.get("exchange"),
    industry: formData.get("industry"),
    companyType: formData.get("companyType"),
    watchStatus: formData.get("watchStatus"),
    valuationStatus: formData.get("valuationStatus"),
    inCircle: formData.get("inCircle") === "on",
    thesis: formData.get("thesis"),
    keyRisks: formData.get("keyRisks"),
    nextAction: formData.get("nextAction"),
    description: formData.get("description")
  });

  if (!parsed.success) {
    return;
  }

  const createdAt = now();

  await db.insert(companies).values({
    id: crypto.randomUUID(),
    ...parsed.data,
    stockCode: normalizeCode(parsed.data.stockCode),
    createdAt,
    updatedAt: createdAt
  });

  revalidatePath("/watchlist");
}

export async function updateCompany(formData: FormData) {
  const parsed = updateSchema.safeParse({
    companyId: formData.get("companyId"),
    stockCode: formData.get("stockCode"),
    stockName: formData.get("stockName"),
    exchange: formData.get("exchange"),
    industry: formData.get("industry"),
    companyType: formData.get("companyType"),
    watchStatus: formData.get("watchStatus"),
    valuationStatus: formData.get("valuationStatus"),
    inCircle: formData.get("inCircle") === "on",
    thesis: formData.get("thesis"),
    keyRisks: formData.get("keyRisks"),
    nextAction: formData.get("nextAction"),
    description: formData.get("description")
  });

  if (!parsed.success) {
    return;
  }

  const { companyId, ...values } = parsed.data;

  await db
    .update(companies)
    .set({
      ...values,
      stockCode: normalizeCode(values.stockCode),
      updatedAt: now()
    })
    .where(eq(companies.id, companyId));

  revalidatePath("/watchlist");
}
