import { TrainingArena } from "@/components/training/training-arena";
import { getRecentTrainingResults } from "@/lib/learning/progress";
import { trainingQuestions } from "@/lib/training/questions";
import { saveTrainingResult } from "./actions";

export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  const recentResults = await getRecentTrainingResults();

  return <TrainingArena questions={trainingQuestions} recentResults={recentResults} onSaveResult={saveTrainingResult} />;
}
