export type LearningStatus = "not_started" | "in_progress" | "completed";

export const learningStatusLabels: Record<LearningStatus, string> = {
  not_started: "未开始",
  in_progress: "学习中",
  completed: "已学完"
};
