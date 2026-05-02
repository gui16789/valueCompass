"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { decisions, reviews } from "@/db/schema";

const reviewSchema = z.object({
  decisionId: z.string().trim().optional(),
  reviewType: z.enum(["post_decision", "quarterly", "annual", "mistake"]),
  reviewDate: z.string().trim().min(1, "请选择复盘日期。"),
  whatHappened: z.string().trim().min(1, "请填写实际发生了什么。"),
  assumptionsValidated: z.string().trim().default(""),
  assumptionsFailed: z.string().trim().default(""),
  lessons: z.string().trim().min(1, "请填写经验教训。"),
  principleChangesNeeded: z.string().trim().default("")
});

function now() {
  return new Date().toISOString();
}

function statusRedirect(status: string, message: string): never {
  redirect(`/reviews?status=${encodeURIComponent(status)}&message=${encodeURIComponent(message)}`);
}

export async function saveReview(formData: FormData) {
  const parsed = reviewSchema.safeParse({
    decisionId: String(formData.get("decisionId") ?? "").trim() || undefined,
    reviewType: formData.get("reviewType"),
    reviewDate: formData.get("reviewDate"),
    whatHappened: formData.get("whatHappened"),
    assumptionsValidated: formData.get("assumptionsValidated"),
    assumptionsFailed: formData.get("assumptionsFailed"),
    lessons: formData.get("lessons"),
    principleChangesNeeded: formData.get("principleChangesNeeded")
  });

  if (!parsed.success) {
    statusRedirect("error", parsed.error.issues[0]?.message ?? "复盘记录校验失败。");
  }

  const [decision] = parsed.data.decisionId
    ? await db.select().from(decisions).where(eq(decisions.id, parsed.data.decisionId)).limit(1)
    : [];
  const timestamp = now();

  await db.insert(reviews).values({
    id: crypto.randomUUID(),
    decisionId: parsed.data.decisionId ?? null,
    companyId: decision?.companyId ?? null,
    reviewType: parsed.data.reviewType,
    reviewDate: parsed.data.reviewDate,
    whatHappened: parsed.data.whatHappened,
    assumptionsValidated: parsed.data.assumptionsValidated,
    assumptionsFailed: parsed.data.assumptionsFailed,
    lessons: parsed.data.lessons,
    principleChangesNeeded: parsed.data.principleChangesNeeded,
    aiSummary: "",
    createdAt: timestamp,
    updatedAt: timestamp
  });

  revalidatePath("/reviews");
  statusRedirect("success", "复盘记录已保存。");
}
