export const checklistStatuses = [
  { value: "pass", label: "通过", tone: "text-emerald-700" },
  { value: "fail", label: "失败", tone: "text-red-700" },
  { value: "unknown", label: "未知", tone: "text-amber-700" },
  { value: "not_applicable", label: "不适用", tone: "text-muted-foreground" }
];

export const checklistTypes = [
  { value: "buy", label: "买入检查", decisionLabel: "用户买入前判断" },
  { value: "sell", label: "卖出检查", decisionLabel: "用户卖出前判断" },
  { value: "do_nothing", label: "不操作检查", decisionLabel: "用户不操作判断" }
];

export type ChecklistType = (typeof checklistTypes)[number]["value"];

export type ChecklistTemplateItem = {
  id: string;
  text: string;
  category: string;
  required: boolean;
};

export const checklistTemplates: Record<ChecklistType, ChecklistTemplateItem[]> = {
  buy: [
    { id: "circle", text: "公司是否在我的能力圈内，且我能解释它靠什么赚钱？", category: "能力圈", required: true },
    { id: "business", text: "商业模式、竞争优势和行业结构是否经得起反方质疑？", category: "商业质量", required: true },
    { id: "financial", text: "财务质量是否满足原则中的最低标准，现金流和负债是否可接受？", category: "财务质量", required: true },
    { id: "valuation", text: "估值是否有明确假设、区间和足够安全边际？", category: "估值纪律", required: true },
    { id: "risk", text: "最关键风险是否已经写清，并且知道什么事实会推翻判断？", category: "风险", required: true },
    { id: "position", text: "仓位是否符合单一公司、行业和组合风险规则？", category: "仓位", required: false }
  ],
  sell: [
    { id: "thesis_broken", text: "最初投资假设是否已经被事实推翻？", category: "假设", required: true },
    { id: "fundamental", text: "商业模式、财务质量或治理是否出现持续恶化？", category: "基本面", required: true },
    { id: "valuation_high", text: "当前估值是否明显透支未来回报，且安全边际已经消失？", category: "估值", required: true },
    { id: "better_use", text: "是否有更符合原则、风险收益更清晰的资金用途？", category: "机会成本", required: false },
    { id: "emotion", text: "这个动作是否不是因为短期波动、恐惧或厌烦而做？", category: "纪律", required: true }
  ],
  do_nothing: [
    { id: "insufficient_info", text: "关键信息是否不足，继续研究比马上行动更合理？", category: "证据", required: true },
    { id: "price_unattractive", text: "价格是否没有给出足够安全边际？", category: "价格", required: true },
    { id: "outside_circle", text: "公司是否暂时超出能力圈，无法判断关键变量？", category: "能力圈", required: false },
    { id: "no_forced_action", text: "我是否没有为了参与行情、回本或证明自己而强行动作？", category: "行为纪律", required: true },
    { id: "next_action", text: "是否写清下一步观察事项、触发条件或复查时间？", category: "下一步", required: true }
  ]
};

export function labelFor<T extends { value: string; label: string }>(options: T[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}
