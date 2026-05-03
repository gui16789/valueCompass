import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { learningProgress, trainingResults } from "@/db/schema";
import type { LearningStatus } from "@/lib/learning/status";

export type LearningProgressRow = typeof learningProgress.$inferSelect;
export type TrainingResultRow = typeof trainingResults.$inferSelect;

export async function getLearningProgressRows() {
  return db.select().from(learningProgress);
}

export async function getLearningProgressByNodeId() {
  const rows = await getLearningProgressRows();
  return Object.fromEntries(rows.map((row) => [row.nodeId, row]));
}

export async function getRecentTrainingResults(limit = 5) {
  return db
    .select()
    .from(trainingResults)
    .orderBy(desc(trainingResults.createdAt))
    .limit(limit);
}

export function parseWeakTopics(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
