import { PlaceholderPage } from "@/components/ui/placeholder-page";

export default function ReviewsPage() {
  return (
    <PlaceholderPage
      title="复盘"
      description="记录假设是否成立、错误类型、经验教训和原则修订建议。"
      items={["单次决策复盘", "季度复盘", "年度复盘", "错误案例库"]}
    />
  );
}
