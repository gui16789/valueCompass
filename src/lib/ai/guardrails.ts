const blockedAdvicePatterns = [
  "应该买入",
  "应该卖出",
  "建议买入",
  "建议卖出",
  "可以买入",
  "可以卖出",
  "继续持有",
  "必须买入",
  "必须卖出",
  "最佳买点",
  "保证收益",
  "必涨",
  "满仓",
  "重仓",
  "加杠杆"
];

export function hasDirectTradingAdvice(content: string) {
  return blockedAdvicePatterns.some((pattern) => content.includes(pattern));
}

export function sanitizeDirectTradingAdvice(content: string) {
  const sanitized = blockedAdvicePatterns.reduce(
    (current, pattern) => current.replaceAll(pattern, "不直接作出买卖结论"),
    content
  );

  return `${sanitized}

边界提醒：上面的内容仅用于学习、研究和复盘，不构成买入、卖出或持有建议。请回到你的投资原则、估值假设、风险清单和待确认事实，最终判断由你自己完成。`;
}
