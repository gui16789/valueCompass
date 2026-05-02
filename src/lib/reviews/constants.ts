export const reviewTypes = [
  { value: "post_decision", label: "单次决策复盘" },
  { value: "quarterly", label: "季度复盘" },
  { value: "annual", label: "年度复盘" },
  { value: "mistake", label: "错误案例复盘" }
] as const;

export function labelFor<T extends { value: string; label: string }>(options: readonly T[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}
