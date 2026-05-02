const blockedAdvicePatterns = [
  "应该买入",
  "应该卖出",
  "必须买入",
  "必须卖出",
  "最佳买点",
  "保证收益",
  "必涨"
];

export function hasDirectTradingAdvice(content: string) {
  return blockedAdvicePatterns.some((pattern) => content.includes(pattern));
}
