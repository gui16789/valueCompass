"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { learningProgress } from "@/db/schema";
import type { LearningStatus } from "@/lib/learning/status";

const learningStatusSchema = z.enum(["not_started", "in_progress", "completed"]);

const formSchema = z.object({
  nodeId: z.string().min(1),
  status: learningStatusSchema
});

function now() {
  return new Date().toISOString();
}

export async function updateLearningStatus(formData: FormData) {
  const parsed = formSchema.safeParse({
    nodeId: formData.get("nodeId"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    return;
  }

  await setLearningStatus(parsed.data.nodeId, parsed.data.status);
}

export async function setLearningStatus(nodeId: string, status: LearningStatus) {
  const updatedAt = now();
  const completedAt = status === "completed" ? updatedAt : null;
  const masteryScore = status === "completed" ? 100 : status === "in_progress" ? 40 : 0;

  await db
    .insert(learningProgress)
    .values({
      id: nodeId,
      nodeId,
      status,
      masteryScore,
      completedAt,
      createdAt: updatedAt,
      updatedAt
    })
    .onConflictDoUpdate({
      target: learningProgress.id,
      set: {
        status,
        masteryScore,
        completedAt,
        updatedAt
      }
    });

  revalidatePath("/");
  revalidatePath("/learn");
  revalidatePath(`/learn/${nodeId}`);
}

export async function resetLearningStatus(formData: FormData) {
  const nodeId = String(formData.get("nodeId") ?? "");

  if (!nodeId) {
    return;
  }

  await db.delete(learningProgress).where(eq(learningProgress.id, nodeId));

  revalidatePath("/");
  revalidatePath("/learn");
  revalidatePath(`/learn/${nodeId}`);
}
