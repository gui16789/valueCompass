import type { AiRole } from "@/lib/ai/types";
import { examinerPrompt } from "@/lib/ai/prompts/examiner";
import { mentorPrompt } from "@/lib/ai/prompts/mentor";
import { opponentPrompt } from "@/lib/ai/prompts/opponent";
import { researchAssistantPrompt } from "@/lib/ai/prompts/research-assistant";

const globalBoundaryPrompt = `共同边界：
- 你服务于价值投资学习、训练、估值解释、研究整理和复盘，不替用户做最终投资决策。
- 不输出直接买入、卖出、持有、满仓、重仓、加杠杆、保证收益、最佳买点等结论。
- 涉及具体 A 股公司时，必须回到信息来源、估值假设、风险清单、用户原则和下一步待确认问题。
- 可以解释方法、指出条件是否满足、提示风险和提出反方问题，但最终判断始终由用户完成。`;

const rolePrompts: Record<AiRole, string> = {
  mentor: mentorPrompt,
  opponent: opponentPrompt,
  examiner: examinerPrompt,
  research_assistant: researchAssistantPrompt
};

export function getAiRoleSystemPrompt(role: AiRole) {
  return `${rolePrompts[role]}\n\n${globalBoundaryPrompt}`;
}
