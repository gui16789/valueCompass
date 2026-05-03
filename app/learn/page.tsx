import { LearningMap } from "@/components/learning/learning-map";
import { knowledgeNodes } from "@/lib/learning/nodes";
import { getLearningProgressByNodeId } from "@/lib/learning/progress";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const progressByNodeId = await getLearningProgressByNodeId();

  return <LearningMap nodes={knowledgeNodes} progressByNodeId={progressByNodeId} />;
}
