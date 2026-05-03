"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { trainingResults } from "@/db/schema";

const trainingResultSchema = z.object({
  questionSet: z.array(z.string().min(1)).min(1),
  answers: z.record(z.string().min(1), z.string().min(1)),
  weakTopics: z.array(z.string()).default([]),
  answeredCount: z.number().int().min(0),
  correctCount: z.number().int().min(0),
  score: z.number().int().min(0).max(100),
  reviewAdvice: z.string().default(""),
  examinerPrompt: z.string().default("")
});

export type TrainingResultInput = z.infer<typeof trainingResultSchema>;

export async function saveTrainingResult(input: TrainingResultInput) {
  const parsed = trainingResultSchema.safeParse(input);

  if (!parsed.success || parsed.data.answeredCount === 0) {
    return;
  }

  await db.insert(trainingResults).values({
    id: crypto.randomUUID(),
    questionSetJson: JSON.stringify(parsed.data.questionSet),
    answersJson: JSON.stringify(parsed.data.answers),
    weakTopicsJson: JSON.stringify(parsed.data.weakTopics),
    answeredCount: parsed.data.answeredCount,
    correctCount: parsed.data.correctCount,
    score: parsed.data.score,
    reviewAdvice: parsed.data.reviewAdvice,
    examinerPrompt: parsed.data.examinerPrompt,
    createdAt: new Date().toISOString()
  });

  revalidatePath("/training");
}
