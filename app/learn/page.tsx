import { LearningMap } from "@/components/learning/learning-map";
import { knowledgeNodes } from "@/lib/learning/nodes";

export default function LearnPage() {
  return <LearningMap nodes={knowledgeNodes} />;
}
