import { TrainingArena } from "@/components/training/training-arena";
import { trainingQuestions } from "@/lib/training/questions";

export default function TrainingPage() {
  return <TrainingArena questions={trainingQuestions} />;
}
