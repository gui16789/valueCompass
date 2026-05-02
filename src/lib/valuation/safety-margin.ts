export function calculateSafetyMargin(currentPrice: number, estimatedValuePerShare: number) {
  if (estimatedValuePerShare <= 0) {
    return null;
  }

  return (estimatedValuePerShare - currentPrice) / estimatedValuePerShare;
}
