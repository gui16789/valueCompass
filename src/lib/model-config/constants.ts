import type { AiRole } from "@/lib/ai/types";

export const aiRoles: Array<{
  value: AiRole;
  label: string;
  description: string;
}> = [
  {
    value: "mentor",
    label: "耐心导师",
    description: "解释价值投资概念、经典体系和估值工具。"
  },
  {
    value: "opponent",
    label: "反方委员",
    description: "质疑投资理由、估值假设和纪律执行。"
  },
  {
    value: "examiner",
    label: "考官",
    description: "通过测验和追问检验概念掌握度。"
  },
  {
    value: "research_assistant",
    label: "研究助理",
    description: "整理用户提供的公告、财报和公司资料。"
  }
];
