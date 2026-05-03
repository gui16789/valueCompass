"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { companies, companyResearchSources } from "@/db/schema";

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

const extractionDraftSchema = z.object({
  companyId: z.string().trim().min(1),
  industry: z.string().trim().default(""),
  companyType: z.string().trim().default("other"),
  description: z.string().trim().default(""),
  thesis: z.string().trim().default(""),
  keyRisks: z.string().trim().default(""),
  nextAction: z.string().trim().default("")
});

const sourceSchema = z.object({
  companyId: z.string().trim().min(1),
  title: z.string().trim().min(1, "请填写资料标题"),
  sourceType: z.string().trim().default("manual_note"),
  sourceName: z.string().trim().default(""),
  sourceDate: z.string().trim().default(""),
  url: z.string().trim().default(""),
  excerpt: z.string().trim().default(""),
  keyPoints: z.string().trim().default(""),
  verificationStatus: z.string().trim().default("pending"),
  notes: z.string().trim().default("")
});

const updateSourceStatusSchema = z.object({
  sourceId: z.string().trim().min(1),
  companyId: z.string().trim().min(1),
  verificationStatus: z.string().trim().min(1)
});

const archiveSourceSchema = z.object({
  sourceId: z.string().trim().min(1),
  companyId: z.string().trim().min(1),
  confirmArchive: z.literal("on")
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
  revalidatePath(`/watchlist/${companyId}`);
}

export async function applyExtractionDraft(formData: FormData) {
  const parsed = extractionDraftSchema.safeParse({
    companyId: formData.get("companyId"),
    industry: formData.get("industry"),
    companyType: formData.get("companyType"),
    description: formData.get("description"),
    thesis: formData.get("thesis"),
    keyRisks: formData.get("keyRisks"),
    nextAction: formData.get("nextAction")
  });

  if (!parsed.success) {
    return;
  }

  const { companyId, ...values } = parsed.data;

  await db
    .update(companies)
    .set({
      ...values,
      watchStatus: "researching",
      updatedAt: now()
    })
    .where(eq(companies.id, companyId));

  revalidatePath("/watchlist");
  revalidatePath(`/watchlist/${companyId}`);
}

export async function addResearchSource(formData: FormData) {
  const parsed = sourceSchema.safeParse({
    companyId: formData.get("companyId"),
    title: formData.get("title"),
    sourceType: formData.get("sourceType"),
    sourceName: formData.get("sourceName"),
    sourceDate: formData.get("sourceDate"),
    url: formData.get("url"),
    excerpt: formData.get("excerpt"),
    keyPoints: formData.get("keyPoints"),
    verificationStatus: formData.get("verificationStatus"),
    notes: formData.get("notes")
  });

  if (!parsed.success) {
    return;
  }

  const createdAt = now();

  await db.insert(companyResearchSources).values({
    id: crypto.randomUUID(),
    ...parsed.data,
    active: true,
    createdAt,
    updatedAt: createdAt
  });

  revalidatePath("/watchlist");
  revalidatePath(`/watchlist/${parsed.data.companyId}`);
}

export async function updateResearchSourceStatus(formData: FormData) {
  const parsed = updateSourceStatusSchema.safeParse({
    sourceId: formData.get("sourceId"),
    companyId: formData.get("companyId"),
    verificationStatus: formData.get("verificationStatus")
  });

  if (!parsed.success) {
    return;
  }

  await db
    .update(companyResearchSources)
    .set({
      verificationStatus: parsed.data.verificationStatus,
      updatedAt: now()
    })
    .where(eq(companyResearchSources.id, parsed.data.sourceId));

  revalidatePath(`/watchlist/${parsed.data.companyId}`);
}

export async function archiveResearchSource(formData: FormData) {
  const parsed = archiveSourceSchema.safeParse({
    sourceId: formData.get("sourceId"),
    companyId: formData.get("companyId"),
    confirmArchive: formData.get("confirmArchive")
  });

  if (!parsed.success) {
    return;
  }

  await db
    .update(companyResearchSources)
    .set({
      active: false,
      updatedAt: now()
    })
    .where(eq(companyResearchSources.id, parsed.data.sourceId));

  revalidatePath(`/watchlist/${parsed.data.companyId}`);
}
