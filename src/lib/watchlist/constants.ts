export const exchanges = [
  { value: "SH", label: "上交所" },
  { value: "SZ", label: "深交所" },
  { value: "BJ", label: "北交所" }
];

export const companyTypes = [
  { value: "consumer", label: "消费" },
  { value: "financial", label: "金融" },
  { value: "cyclical", label: "周期" },
  { value: "manufacturing", label: "制造" },
  { value: "healthcare", label: "医药" },
  { value: "technology", label: "科技" },
  { value: "other", label: "其他" }
];

export const watchStatuses = [
  { value: "watching", label: "观察中" },
  { value: "researching", label: "深研中" },
  { value: "waiting_price", label: "等待价格" },
  { value: "holding", label: "已持有" },
  { value: "excluded", label: "已排除" }
];

export const valuationStatuses = [
  { value: "not_started", label: "未估值" },
  { value: "rough", label: "粗估完成" },
  { value: "scenario", label: "三情景完成" },
  { value: "needs_review", label: "待复核" }
];

export const researchSourceTypes = [
  { value: "annual_report", label: "年报 / 季报" },
  { value: "announcement", label: "公告" },
  { value: "research_note", label: "研究笔记" },
  { value: "interview", label: "访谈 / 调研" },
  { value: "manual_note", label: "手动记录" },
  { value: "other", label: "其他" }
];

export const sourceVerificationStatuses = [
  { value: "pending", label: "待确认" },
  { value: "confirmed", label: "已确认" },
  { value: "needs_review", label: "待复核" },
  { value: "rejected", label: "已排除" }
];

export function labelFor(options: Array<{ value: string; label: string }>, value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}
