export const valuationTemplates = [
  {
    value: "financial",
    label: "金融股模板",
    method: "PB-ROE / 股息辅助",
    basisLabel: "每股净资产",
    basisHint: "元/股，例如银行常用每股净资产作为估值起点。",
    multipleLabel: "PB 倍数",
    growthLabel: "ROE 或利润变化",
    focus: "关注 ROE 可持续性、资产质量、不良率、拨备和资本充足。",
    fitFor: "银行、保险、券商等资产负债表驱动的金融机构。",
    avoidFor: "不适合用来估值制造业、消费品、资源品和轻资产成长公司。",
    examples: "招商银行、平安银行、中国平安、中信证券"
  },
  {
    value: "cyclical",
    label: "周期股模板",
    method: "周期中枢利润 PE",
    basisLabel: "中枢净利润",
    basisHint: "亿元，尽量使用跨周期利润中枢，而不是景气顶部利润。",
    multipleLabel: "中枢 PE 倍数",
    growthLabel: "利润修正",
    focus: "关注当前景气位置、商品价格、负债和资本开支。",
    fitFor: "利润跟商品价格、产能周期或行业景气强相关的公司。",
    avoidFor: "不要直接拿景气顶部利润做估值起点，也不要用于需求稳定的消费龙头。",
    examples: "中国神华、宝钢股份、万华化学、紫金矿业"
  },
  {
    value: "consumer",
    label: "消费股模板",
    method: "利润增长后的 PE 情景",
    basisLabel: "当前净利润",
    basisHint: "亿元，使用最近一年归母净利润或更保守的正常化利润。",
    multipleLabel: "合理 PE 倍数",
    growthLabel: "未来三年年化利润增长",
    focus: "关注增长、ROE、现金流、渠道库存、提价能力和品牌强度。",
    fitFor: "品牌、渠道、复购和利润稳定性较强的消费公司。",
    avoidFor: "不适合资本开支很重、现金流波动大或利润明显周期化的公司作为唯一模板。",
    examples: "贵州茅台、伊利股份、海天味业、美的集团（交叉验证）"
  },
  {
    value: "manufacturing",
    label: "制造业模板",
    method: "五年简化 DCF + PE 交叉验证",
    basisLabel: "自由现金流起点",
    basisHint: "亿元，尽量使用可持续自由现金流，而不是单年高点。",
    multipleLabel: "备用 PE 倍数",
    growthLabel: "未来五年 FCF 增长",
    focus: "关注资本开支、研发、存货、应收、客户集中和竞争格局。",
    fitFor: "成熟制造、消费制造、现金流可估、资本开支和营运资本需要跟踪的公司。",
    avoidFor: "不适合金融机构；高波动周期股需要先用周期中枢利润校验。",
    examples: "美的集团、格力电器、海尔智家、三一重工"
  }
] as const;

export type ValuationTemplateType = (typeof valuationTemplates)[number]["value"];

export type ScenarioName = "bear" | "base" | "bull";

export const scenarios = [
  { value: "bear", label: "悲观" },
  { value: "base", label: "中性" },
  { value: "bull", label: "乐观" }
] as const;

export function labelFor<T extends { value: string; label: string }>(options: readonly T[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function getTemplate(type: string) {
  return valuationTemplates.find((template) => template.value === type) ?? valuationTemplates[0];
}
